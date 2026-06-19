import API from "./api";

export const loginUser = async (
  email_id: string,
  password: string
) => {
  const response = await API.post(
    "/auth/login",
    {
      email_id,
      password,
    }
  );

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await API.get(
    "/users/me"
  );

  return response.data;
};