import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

export async function getDGRSummary() {

  const response =
    await axios.get(
      `${API_URL}/analytics/dgr/summary`
    );

  return response.data;
}

export async function getDGRRegions() {

  const response =
    await axios.get(
      `${API_URL}/analytics/dgr/regions`
    );

  return response.data;
}