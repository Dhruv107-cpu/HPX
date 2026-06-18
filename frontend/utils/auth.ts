export const getCurrentUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const user = localStorage.getItem("currentUser");

  return user ? JSON.parse(user) : null;
};