import { post, get, patch } from "@/lib/api";

export interface WalkInRequest {
  name: string;
  phoneNumber: string;
  licensePlate: string;
  vehicleType: string;
  // Các field cho images sẽ được thêm vào payload form-data ở component nếu backend yêu cầu multipart/form-data
  // Trong trường hợp này gửi JSON thô theo yêu cầu:
}

export interface WalkInResponse {
  statusCode: number;
  message: string;
  data: {
    bookingId: string;
    [key: string]: any;
  };
}

class ParkingService {
  /**
   * Đăng ký khách vãng lai (walk-in) vào bãi đỗ xe
   * POST /parking-lots/:id/walk-in
   */
  async walkInCheckIn(lotId: number, payload: WalkInRequest): Promise<WalkInResponse> {
    try {
      const response = await post<WalkInResponse>(`/parking-lots/${lotId}/walk-in`, payload);
      return response;
    } catch (error) {
      console.error("Error in walkInCheckIn:", error);
      throw error;
    }
  }

  /**
   * Thêm Tầng (Floor) vào bãi đỗ xe
   * POST /parking-lots/:id/floors
   */
  async createFloor(lotId: number, payload: { floor_name: string; floor_number: number; description?: string }) {
    return post<any>(`/parking-lots/${lotId}/floors`, payload);
  }

  /**
   * Thêm Khu vực (Zone) vào tầng
   * POST /parking-lots/floors/:floorId/zones
   */
  async createZone(floorId: number, payload: { zone_name: string; prefix: string; total_slots: number; description?: string }) {
    return post<any>(`/parking-lots/floors/${floorId}/zones`, payload);
  }

  /**
   * Cập nhật Khu vực (Zone) (cũ)
   * PATCH /parking-lots/zones/:zoneId
   */
  // Đã được thay thế bằng hàm mới dưới đây nhưng giữ lại nếu có code cũ gọi
  async updateZoneOld(zoneId: number, payload: { total_slots: number }) {
    return patch<any>(`/parking-lots/zones/${zoneId}`, payload);
  }

  /**
   * Cập nhật Tầng (Floor)
   * PATCH /parking-lots/:lotId/floors/:floorId
   */
  async updateFloor(lotId: number, floorId: number, payload: { floor_name?: string; floor_number?: number; description?: string }) {
    return patch<any>(`/parking-lots/${lotId}/floors/${floorId}`, payload);
  }

  /**
   * Cập nhật Khu vực (Zone) mới
   * PATCH /parking-lots/:lotId/floors/:floorId/zones/:zoneId
   */
  async updateZone(lotId: number, floorId: number, zoneId: number, payload: { zone_name?: string; prefix?: string; description?: string; total_slots?: number }) {
    return patch<any>(`/parking-lots/${lotId}/floors/${floorId}/zones/${zoneId}`, payload);
  }

  /**
   * Cập nhật Bảng giá (Pricing Rule)
   * PATCH /payment/pricing-rule/:lotId/floors/:floorId/zones/:zoneId/rule/:ruleId
   */
  async updatePricingRule(lotId: number, floorId: number, zoneId: number, ruleId: number, payload: { price_per_hour?: number; price_per_day?: number }) {
    return patch<any>(`/payment/pricing-rule/${lotId}/floors/${floorId}/zones/${zoneId}/rule/${ruleId}`, payload);
  }

  /**
   * Lấy cấu trúc bãi đỗ xe (Tầng -> Khu vực -> Slots)
   * GET /parking-lots/:id/structure (Giả định endpoint này tồn tại để load UI)
   */
  async getParkingLotStructure(lotId: number) {
    return get<any>(`/parking-lots/${lotId}/structure`);
  }

  /**
   * Thiết lập giá tiền cho khu vực
   * POST /payment/pricing-rule
   */
  async createPricingRule(payload: {
    price_per_hour: number;
    price_per_day: number;
    parking_lot_id: number;
    parking_floor_id: number;
    parking_zone_id: number;
  }) {
    return post<any>(`/payment/pricing-rule`, payload);
  }

  /**
   * Lấy danh sách tầng
   * GET /parking-lots/:id/floors
   */
  async getFloors(lotId: number) {
    return get<any>(`/parking-lots/${lotId}/floors`);
  }

  /**
   * Lấy danh sách khu vực của tầng
   * GET /parking-lots/:lotId/floors/:floorId/zones
   */
  async getZones(lotId: number, floorId: number) {
    return get<any>(`/parking-lots/${lotId}/floors/${floorId}/zones`);
  }

  /**
   * Lấy danh sách slots của 1 zone (thực tế từ DB)
   * GET /parking-lots/:lotId/floors/:floorId/zones/:zoneId/slots
   * GET /parking-lots/:lotId/floors/:floorId/zones/:zoneId/slots?includeDisabled=true
   */
  async getZoneSlots(lotId: number, floorId: number, zoneId: number, includeDisabled = false) {
    const query = includeDisabled ? "?includeDisabled=true" : "";
    return get<any>(`/parking-lots/${lotId}/floors/${floorId}/zones/${zoneId}/slots${query}`);
  }

  /**
   * Generate/Sync slots cho toàn bộ Lot
   * POST /parking-lots/:lotId/generate-slots
   */
  async generateSlotsForLot(lotId: number) {
    return post<any>(`/parking-lots/${lotId}/generate-slots`, {});
  }

  /**
   * Generate/Sync slots cho 1 Floor
   * POST /parking-lots/:lotId/floors/:floorId/generate-slots
   */
  async generateSlotsForFloor(lotId: number, floorId: number) {
    return post<any>(`/parking-lots/${lotId}/floors/${floorId}/generate-slots`, {});
  }

  /**
   * Generate/Sync slots cho 1 Zone
   * POST /parking-lots/:lotId/floors/:floorId/zones/:zoneId/generate-slots
   */
  async generateSlotsForZone(lotId: number, floorId: number, zoneId: number) {
    return post<any>(`/parking-lots/${lotId}/floors/${floorId}/zones/${zoneId}/generate-slots`, {});
  }
}

export const parkingService = new ParkingService();
