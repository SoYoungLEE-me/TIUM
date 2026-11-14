/** Navbar Avatar와 비슷한 soft 톤 — 시드별 고정, 분포가 넓도록 팔레트 확장 */
const AVATAR_COLORS = [
  { bg: "#F6E7A8", fg: "#5E531A" },
  { bg: "#F1E8F1", fg: "#744577" },
  { bg: "#E7F1E3", fg: "#3F6E3A" },
  { bg: "#E2F2EC", fg: "#2F7A65" },
  { bg: "#F8E1DC", fg: "#A8402F" },
  { bg: "#E3EEF8", fg: "#2F5A8A" },
  { bg: "#F3E8FF", fg: "#6B3FA0" },
  { bg: "#FFE8D6", fg: "#9A4E1C" },
  { bg: "#D6F0F5", fg: "#1F6B78" },
  { bg: "#F5D6E8", fg: "#8A3A62" },
  { bg: "#E8F5D6", fg: "#4A6B1F" },
  { bg: "#D6E0F5", fg: "#334F8A" },
  { bg: "#FFF0D6", fg: "#8A6B1A" },
  { bg: "#E0D6F5", fg: "#5A3A8A" },
  { bg: "#D6F5E8", fg: "#1F6B52" },
  { bg: "#F5E0D6", fg: "#8A4A2F" },
] as const;

/** djb2 계열 — UUID처럼 비슷한 문자열도 고르게 분산 */
export const getAvatarColor = (seed: string) => {
  let hash = 5381;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 33) ^ seed.charCodeAt(i);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index] ?? AVATAR_COLORS[0];
};

/** Navbar와 동일: 이름 첫 글자 */
export const getAvatarInitial = (name: string) => {
  const trimmed = name.trim();
  return trimmed ? trimmed.slice(0, 1) : "?";
};
