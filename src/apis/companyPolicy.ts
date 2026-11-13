import type { SettingsBundle } from "../models/apis/settings";
import { fetchSettingsBundle } from "./settingsBundle";

export const getCompanyPolicy = async (): Promise<SettingsBundle> =>
  fetchSettingsBundle();
