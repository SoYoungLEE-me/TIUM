import { supabase } from "../libs/supabaseClient";
import { rpc, unwrap } from "./apiRequest";
import { getMe } from "./me";

export type InquiryThreadStatus = "draft" | "open" | "closed";

export type InquiryThread = {
  id: string;
  employee_id: string;
  subject: string;
  status: InquiryThreadStatus;
  last_message_at: string;
  unread_admin: number;
  unread_employee: number;
  created_at: string;
  /** 사용자(직원/관리자) 채팅 메시지 1건 이상 여부 — 없으면 임시 저장 */
  has_user_message: boolean;
  employees?: {
    full_name: string;
    email: string;
    department: string | null;
  } | null;
};

type InquiryThreadRow = Omit<InquiryThread, "has_user_message"> & {
  inquiry_messages?: { kind: string }[] | null;
};

const mapInquiryThread = (row: InquiryThreadRow): InquiryThread => {
  const hasUserMessage = (row.inquiry_messages ?? []).some(
    (m) => m.kind === "user",
  );
  const { inquiry_messages: _msgs, ...rest } = row;
  // 사용자 메시지 없는 open → UI/삭제 기준상 draft
  const status: InquiryThreadStatus =
    rest.status === "open" && !hasUserMessage ? "draft" : rest.status;
  return {
    ...rest,
    status,
    has_user_message: hasUserMessage,
  };
};

/** 메시지가 작성된 채팅방(채널) */
export type InquiryMessageChannel = "chatbot" | "admin";

export type InquiryMessage = {
  id: string;
  thread_id: string;
  sender_id: string | null;
  sender_role: "employee" | "hr_admin" | null;
  kind: "user" | "system";
  /** chatbot=직원 챗봇, admin=관리자 문의함. system 은 null */
  channel: InquiryMessageChannel | null;
  body: string;
  created_at: string;
};

const mapInquiryMessage = (m: InquiryMessage): InquiryMessage => {
  const kind = m.kind ?? "user";
  let channel = m.channel ?? null;
  // 마이그레이션 전/누락분: sender_role 로 보정
  if (kind === "user" && !channel) {
    if (m.sender_role === "hr_admin") channel = "admin";
    else if (m.sender_role === "employee") channel = "chatbot";
  }
  return { ...m, kind, channel };
};

export const listMyInquiryThreads = async (opts?: {
  page?: number;
  pageSize?: number;
}): Promise<{ data: InquiryThread[]; total: number }> => {
  const me = await getMe();
  const page = opts?.page ?? 1;
  const pageSize = opts?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const result = await supabase
    .from("inquiry_threads")
    .select("*, inquiry_messages(kind)", { count: "exact" })
    .eq("employee_id", me.id)
    .order("last_message_at", { ascending: false })
    .range(from, to);

  const data = await unwrap(result);
  return {
    data: ((data ?? []) as InquiryThreadRow[]).map(mapInquiryThread),
    total: result.count ?? 0,
  };
};

export const listAdminInquiryThreads = async (opts?: {
  page?: number;
  pageSize?: number;
}): Promise<{ data: InquiryThread[]; total: number }> => {
  const page = opts?.page ?? 1;
  const pageSize = opts?.pageSize ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // 관리자 목록: 진행 중(open)만 — 임시 저장(draft)·종료(closed) 제외
  const result = await supabase
    .from("inquiry_threads")
    .select(
      "*, inquiry_messages(kind), employees!inquiry_threads_employee_id_fkey(full_name, email, department)",
      { count: "exact" },
    )
    .eq("status", "open")
    .order("last_message_at", { ascending: false })
    .range(from, to);

  const data = await unwrap(result);
  const mapped = ((data ?? []) as InquiryThreadRow[])
    .map(mapInquiryThread)
    // 사용자 메시지 없어 UI상 임시 저장으로 취급되는 open 도 제외
    .filter((t) => t.status === "open" && t.has_user_message);

  return {
    data: mapped,
    total: result.count ?? 0,
  };
};

export const getInquiryMessages = async (
  threadId: string,
): Promise<InquiryMessage[]> => {
  const data = await unwrap(
    supabase
      .from("inquiry_messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true }),
  );
  return ((data ?? []) as InquiryMessage[]).map(mapInquiryMessage);
};

export const getInquiryThread = async (
  threadId: string,
): Promise<InquiryThread | null> => {
  const data = await unwrap(
    supabase
      .from("inquiry_threads")
      .select(
        "*, inquiry_messages(kind), employees!inquiry_threads_employee_id_fkey(full_name, email, department)",
      )
      .eq("id", threadId)
      .maybeSingle(),
  );
  return data ? mapInquiryThread(data as InquiryThreadRow) : null;
};

export const createInquiryThread = async (input?: {
  subject?: string;
  status?: InquiryThreadStatus;
}): Promise<InquiryThread> => {
  const me = await getMe();
  const row = (await unwrap(
    supabase
      .from("inquiry_threads")
      .insert({
        employee_id: me.id,
        subject: input?.subject ?? "관리자 문의",
        status: input?.status ?? "open",
        unread_admin: 0,
      })
      .select("*")
      .single(),
  )) as InquiryThreadRow;
  return mapInquiryThread({ ...row, inquiry_messages: [] });
};

export const sendInquiryMessage = async (input: {
  threadId: string;
  body: string;
  /** 작성 채팅방: chatbot=직원 챗봇, admin=관리자 문의함 */
  channel: InquiryMessageChannel;
}): Promise<InquiryMessage> => {
  const me = await getMe();

  const { data: thread } = await supabase
    .from("inquiry_threads")
    .select("unread_admin, unread_employee, status, employee_id")
    .eq("id", input.threadId)
    .maybeSingle();

  // 호환용 sender_role (표시는 channel 기준)
  const role = input.channel === "admin" ? "hr_admin" : "employee";

  const message = (await unwrap(
    supabase
      .from("inquiry_messages")
      .insert({
        thread_id: input.threadId,
        sender_id: me.id,
        sender_role: role,
        channel: input.channel,
        kind: "user",
        body: input.body.trim(),
      })
      .select("*")
      .single(),
  )) as InquiryMessage;

  if (thread) {
    const promoteFromDraft = thread.status === "draft";
    await unwrap(
      supabase
        .from("inquiry_threads")
        .update({
          last_message_at: new Date().toISOString(),
          ...(promoteFromDraft ? { status: "open" as const } : {}),
          ...(input.channel === "chatbot"
            ? { unread_admin: (thread.unread_admin ?? 0) + 1 }
            : { unread_employee: (thread.unread_employee ?? 0) + 1 }),
        })
        .eq("id", input.threadId),
    );
  }

  return mapInquiryMessage(message);
};

export const insertInquirySystemMessage = async (
  threadId: string,
  body: string,
): Promise<InquiryMessage> => {
  const data = await rpc<InquiryMessage>("insert_inquiry_system_message", {
    p_thread_id: threadId,
    p_body: body,
  });
  return mapInquiryMessage({ ...data, kind: "system", channel: null });
};

export const closeInquiry = async (threadId: string): Promise<InquiryThread> =>
  rpc<InquiryThread>("close_inquiry", { p_thread_id: threadId });

export const deleteInquiry = async (threadId: string): Promise<void> => {
  await rpc("delete_inquiry", { p_thread_id: threadId });
};

export const markInquiryRead = async (
  threadId: string,
  as: "employee" | "hr_admin",
) => {
  const patch =
    as === "employee" ? { unread_employee: 0 } : { unread_admin: 0 };
  await unwrap(
    supabase.from("inquiry_threads").update(patch).eq("id", threadId),
  );
};

export const countUnreadInquiries = async (
  as: "employee" | "hr_admin",
): Promise<number> => {
  const me = await getMe();
  if (as === "employee") {
    const data = await unwrap(
      supabase
        .from("inquiry_threads")
        .select("unread_employee")
        .eq("employee_id", me.id),
    );
    return ((data ?? []) as { unread_employee: number }[]).reduce(
      (sum, row) => sum + (row.unread_employee ?? 0),
      0,
    );
  }
  const data = await unwrap(
    supabase.from("inquiry_threads").select("unread_admin"),
  );
  return ((data ?? []) as { unread_admin: number }[]).reduce(
    (sum, row) => sum + (row.unread_admin ?? 0),
    0,
  );
};

/** 관리자 알림용: 진행 중(open) + 사용자 메시지 있는 문의 건수 */
export const countAdminOpenInquiries = async (): Promise<number> => {
  const data = await unwrap(
    supabase
      .from("inquiry_threads")
      .select("id, inquiry_messages(kind)")
      .eq("status", "open"),
  );
  return ((data ?? []) as InquiryThreadRow[]).filter((row) =>
    (row.inquiry_messages ?? []).some((m) => m.kind === "user"),
  ).length;
};

/** 같은 topic 접두사의 기존 채널 제거 (Strict Mode 재구독 충돌 방지) */
const removeChannelsByPrefix = (prefix: string) => {
  for (const ch of supabase.getChannels()) {
    const topic = ch.topic ?? "";
    if (
      topic === prefix ||
      topic === `realtime:${prefix}` ||
      topic.startsWith(`${prefix}:`) ||
      topic.startsWith(`realtime:${prefix}:`)
    ) {
      void supabase.removeChannel(ch);
    }
  }
};

/** 문의 메시지 INSERT Realtime 구독. cleanup 함수 반환 */
export const subscribeInquiryMessages = (
  threadId: string,
  onInsert: (message: InquiryMessage) => void,
): (() => void) => {
  const prefix = `inquiry-messages:${threadId}`;
  removeChannelsByPrefix(prefix);

  // 고유 이름: subscribe 된 채널에 다시 .on() 붙는 것 방지
  const channel = supabase
    .channel(`${prefix}:${crypto.randomUUID()}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "inquiry_messages",
        filter: `thread_id=eq.${threadId}`,
      },
      (payload) => {
        onInsert(mapInquiryMessage(payload.new as InquiryMessage));
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
};

/** 문의 스레드 변경 Realtime (목록/뱃지 갱신용) */
export const subscribeInquiryThreads = (
  onChange: () => void,
  opts?: { employeeId?: string },
): (() => void) => {
  const filter = opts?.employeeId
    ? `employee_id=eq.${opts.employeeId}`
    : undefined;

  const prefix = opts?.employeeId
    ? `inquiry-threads:employee:${opts.employeeId}`
    : "inquiry-threads:admin";
  removeChannelsByPrefix(prefix);

  const channel = supabase
    .channel(`${prefix}:${crypto.randomUUID()}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "inquiry_threads",
        ...(filter ? { filter } : {}),
      },
      () => {
        onChange();
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
};
