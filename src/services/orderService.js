import api from "./api";

export const getOrders = async (page = 1, limit = 10, query = "") => {
  const response = await api.get("/orders", {
    params: { page, limit, ...(query ? { q: query } : {}) },
  });
  return response.data.data;
};

export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${encodeURIComponent(orderId)}`);
  return response.data.data;
};

export const getOrdersByUser = async (userId, page = 1, limit = 10) => {
  const response = await api.get(
    `/orders/user/${encodeURIComponent(userId)}`,
    { params: { page, limit } },
  );
  return response.data.data;
};

export const updateOrder = async (orderId, updates) => {
  const response = await api.put(
    `/orders/${encodeURIComponent(orderId)}`,
    updates,
  );
  return response.data.data;
};
