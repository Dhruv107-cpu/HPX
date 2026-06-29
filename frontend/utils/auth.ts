export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("access_token");
};

export const setAccessToken = (token: string) => {
  localStorage.setItem("access_token", token);
};

export const clearAuth = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("token");
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

export const getCurrentUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const user = localStorage.getItem("currentUser");

  return user ? JSON.parse(user) : null;
};