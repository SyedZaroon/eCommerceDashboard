import api from "./api";

export const loginUser = async (userData) => {
  try {
    const res = await api.post("/login", userData);
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Login failed"
    );
  }
};

export const logoutUser = async () => {
  try {
    const res = await api.post("/logout");
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Logout failed"
    );
  }
};
