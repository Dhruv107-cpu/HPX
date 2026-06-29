import axios from "axios";

const API_URL =
  "http://127.0.0.1:8000";

export const getFiles =
  async () => {

    const token =
      localStorage.getItem(
        "access_token"
      );

    const response =
      await axios.get(
        `${API_URL}/analytics/files`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    return response.data;
};
export const downloadFile = async (
  id: string,
  fileName: string
) => {

  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `http://127.0.0.1:8000/analytics/files/${id}/download`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to download file");
  }

  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;

  const disposition = response.headers.get("Content-Disposition");

  let filename = "download.xls";

  if (disposition) {
    const match = disposition.match(/filename="?(.+)"?/);
    if (match) {
      filename = match[1];
    }
  }

  a.download = fileName;

  document.body.appendChild(a);

  a.click();

  a.remove();

  window.URL.revokeObjectURL(url);
};