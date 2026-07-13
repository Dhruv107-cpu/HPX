import axios from "axios";
import {
  PowerStation,
  PowerStationFilters,
  PowerStationPortfolio,
} from "@/types/powerStation";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function getPowerStations(
  filters: PowerStationFilters = {}
): Promise<PowerStation[]> {
  const response = await axios.get(
    `${API_BASE_URL}/analytics/power-stations`,
    {
      params: {
        state_code: filters.state_code,
        generation_type: filters.generation_type,
        limit: filters.limit ?? 20,
      },
    }
  );

  return response.data;
}


export async function getPowerStationPortfolio(
  stateCode: string
): Promise<PowerStationPortfolio> {
  const response = await axios.get(
    `${API_BASE_URL}/analytics/power-stations/portfolio/${stateCode}`
  );

  return response.data;
}
