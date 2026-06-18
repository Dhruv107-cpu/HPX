import API from "./api";

export const getUsers = () =>
  API.get("/users/list");

export const getUserById = (
  id: string
) =>
  API.get(`/users/${id}`);

export const createUser = (
  data: any
) =>
  API.post(
    "/users/create",
    data
  );

export const updateUser = (
  id: string,
  data: any
) =>
  API.put(
    `/users/${id}`,
    data
  );

export const deleteUser = (
  id: string
) =>
  API.delete(
    `/users/${id}`
  );

export const getUserStats = () =>
  API.get(
    "/users/stats/summary"
  );