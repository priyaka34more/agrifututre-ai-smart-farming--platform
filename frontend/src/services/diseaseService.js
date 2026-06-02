import API, { API_BASE_URL } from "./api";

const legacyPredictUrl = () =>
  API_BASE_URL.replace(/\/api\/v1\/?$/i, "") + "/predict";

export const detectDisease = async (file, lang = "en") => {
  try {
    console.log("🌱 Sending disease detection request...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("lang", lang);

    const requestConfig = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000,
    };

    let res;
    try {
      res = await API.post("/disease/predict", formData, requestConfig);
    } catch (primaryError) {
      const status = primaryError?.response?.status;
      const detail = String(primaryError?.response?.data?.detail || "").toLowerCase();

      // Fallback for legacy deployments exposing POST /predict
      if (status === 404 || detail.includes("not found")) {
        res = await API.post(legacyPredictUrl(), formData, requestConfig);
      } else {
        throw primaryError;
      }
    }

    const result = res?.data || res;

    if (result?.status === "error") {
      return {
        status: "error",
        message: result.message || "Detection failed. Please try again.",
      };
    }

    return result;
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message;
    return {
      status: "error",
      message: msg || "Server not responding",
    };
  }
};
