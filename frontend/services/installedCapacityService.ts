import axios from "axios";

const API =
  "http://127.0.0.1:8000";

export const getRegionSummary =
  async () => {

    const token =
      localStorage.getItem(
        "access_token"
      );

    const response =
      await axios.get(
        `${API}/analytics/installed-capacity/regions`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

    return response.data;
};

export const getStateSummary =
  async (
    region: string
  ) => {

    const token =
      localStorage.getItem(
        "access_token"
      );

    const response =
      await axios.get(
        `${API}/analytics/installed-capacity/states`,
        {
          params: {
            region
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

    return response.data;
};

export const getMonthlyRegionSummary =
  async () => {

    const token =
      localStorage.getItem(
        "access_token"
      );

    const response =
      await axios.get(
        `${API}/analytics/installed-capacity/monthly/regions`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

    return response.data;
};
