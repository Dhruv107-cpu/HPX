import axios from "axios";
import {
  LiveGenerationSummary,
  LiveGenerationTrend,
} from "@/types/power";

const API_BASE_URL = "http://localhost:8000";

// Fetches the summary (KPI Cards data)
export const getLiveGenerationSummary = async (): Promise<LiveGenerationSummary> => {
  const response = await axios.get(
    `${API_BASE_URL}/analytics/live-generation/summary`
  );
  return response.data;
};

// Fetches the trend data for the two charts
// Ensure your backend endpoint returns objects containing: 
// time, demand_met, thermal_generation, and hydro_generation
export const getLiveGenerationTrend = async (
  interval: string
): Promise<LiveGenerationTrend[]> => {
  const response = await axios.get(
    `${API_BASE_URL}/analytics/live-generation/trend`,
    {
      params: {
        interval,
      },
    }
  );
  return response.data;
};
export const getGenerationTrend = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/analytics/generation-trend`
  );

  return response.data;
};

// Triggers the background update from the government portal
export async function fetchLatestMERIT() {
  const response = await axios.post(
    `${API_BASE_URL}/analytics/merit/fetch`
  );
  return response.data;
}