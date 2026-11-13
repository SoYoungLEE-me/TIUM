import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { supabase } from "../libs/supabase";
import {
  ApiRequestError,
  type ApiErrorResponse,
} from "../models/apis/common";

const baseURL = import.meta.env.VITE_API_BASE_URL || "";

export const apiRequest: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

apiRequest.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

apiRequest.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const payload = error.response?.data?.error;
    if (payload?.code && payload?.message) {
      return Promise.reject(
        new ApiRequestError(
          {
            code: payload.code,
            message: payload.message,
            details: payload.details ?? {},
          },
          { status: error.response?.status, cause: error }
        )
      );
    }

    return Promise.reject(
      new ApiRequestError(
        {
          code: "NETWORK_ERROR",
          message: error.message || "요청에 실패했습니다.",
          details: {},
        },
        { status: error.response?.status, cause: error }
      )
    );
  }
);
