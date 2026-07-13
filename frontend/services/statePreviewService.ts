import axios from "axios";
import { StatePreview } from "@/types/statePreview";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function getStatePreview(
  stateCode: string
): Promise<StatePreview> {
  const response = await axios.get(
    `${API_BASE_URL}/analytics/state-preview`,
    {
      params: {
        state_code: stateCode,
      },
    }
  );

  return response.data;
}