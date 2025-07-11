const BASE = "http://localhost:5000/api/return";

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Return API error");
  return data;
}

const returnApi = {
  createRequest: async (payload) => {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  getReturnSummary: async (orderId) => {
    const res = await fetch(`${BASE}/summary/${orderId}`);
    return handleResponse(res);
  },

  getRequest: async (id) => {
    const res = await fetch(`${BASE}/${id}`);
    return handleResponse(res);
  },

  listAll: async () => {
    const res = await fetch(`${BASE}/all`);
    return handleResponse(res);
  },

  updateRequest: async (requestId, status, note, updatedBy) => {
    const res = await fetch(`${BASE}/${requestId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note, updatedBy }),
    });
    return handleResponse(res);
  },

  cancelRequest: async (requestId) => {
    const res = await fetch(`${BASE}/${requestId}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },

  getRequestsByOrder: async (orderId) => {
    const res = await fetch(`${BASE}/order/${orderId}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(res);
  }
};

export default returnApi;
