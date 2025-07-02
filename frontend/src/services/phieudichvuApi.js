const API_BASE = "http://localhost:5000/api";

export async function getPhieuDichVuList() {
  const res = await fetch(`${API_BASE}/phieudichvu`);
  return await res.json();
}

export async function themPhieuDichVu(data) {
  const res = await fetch(`${API_BASE}/phieudichvu`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}