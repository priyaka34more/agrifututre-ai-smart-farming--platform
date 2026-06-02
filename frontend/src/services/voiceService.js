import api from "./apiService";

export const detectDisease = async (file, lang = "en") => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("lang", lang);

    const res = await api.post("/disease/predict", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000,
    });
    return res?.data || res;
  } catch (error) {
    console.error("API Error:", error);

    return {
      status: "error",
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        "Server not responding",
    };
  }
};
