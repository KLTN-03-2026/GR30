

export interface OcrResponse {
  statusCode: number;
  message: string;
  data: {
    licensePlate: string;
  };
}

export const ocrService = {
  /**
   * Send image to backend for OCR processing
   * POST /parking-lots/ocr
   */
  recognizeLicensePlate: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    let token = null;
    if (typeof window !== "undefined") {
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          token = parsed?.state?.accessToken;
        } catch {}
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/parking-lots/ocr`, {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error(`Lỗi từ máy chủ: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const json = await response.json();
        const extractedPlate = 
          json.data?.licensePlate || 
          json.licensePlate || 
          (typeof json.data === "string" ? json.data : null) || 
          json.data?.plate || 
          json.plate || 
          json.data?.text || 
          json.text;

        // Nếu không trích xuất được chuỗi, stringify để có thể thấy được cấu trúc thay vì [object Object]
        return typeof extractedPlate === "string" ? extractedPlate : JSON.stringify(json);
      } else {
        const text = await response.text();
        return text;
      }
    } catch (error: unknown) {
      console.error("OCR Error:", error);
      throw new Error(error instanceof Error ? error.message : "Lỗi xử lý ảnh biển số");
    }
  },
};
