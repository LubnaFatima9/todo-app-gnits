const API_URL = "/api/todos";

const request = async (url, options) => {
  const res = await fetch(url, options);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.message || `Request failed: ${res.status}`);
  }
  return data;
};

export const getTodos = () => request(API_URL);

export const createTodo = (payload) => {
  const body = typeof payload === "string" ? { title: payload } : payload;
  return request(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

export const updateTodo = (id, data) =>
  request(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const deleteTodo = (id) =>
  request(`${API_URL}/${id}`, { method: "DELETE" });
