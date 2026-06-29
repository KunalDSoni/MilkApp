import { apiClient } from "@/core/api/client";
import { env } from "@/core/config/env";
import { Dashboard, dashboardSchema } from "./schemas";
import { buildDashboard } from "@/features/_mocks/db";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchDashboard(): Promise<Dashboard> {
  if (env.useMocks) {
    await delay(200);
    return dashboardSchema.parse(buildDashboard());
  }
  const { data } = await apiClient.get("/dashboard");
  return dashboardSchema.parse(data);
}
