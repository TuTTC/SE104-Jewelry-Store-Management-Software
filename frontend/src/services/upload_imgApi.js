const API_URL = "http://localhost:5000";

export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data.url; // Trả về link ảnh
  } catch (error) {
    console.error("Lỗi upload ảnh:", error);
    throw error;
  }
};
