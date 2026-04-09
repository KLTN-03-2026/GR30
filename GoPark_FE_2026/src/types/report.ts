export interface Report {
  id: string; // Assuming an ID field exists for identification
  user_id: string;
  parking_lot_id: string;
  booking_id: string | null;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  created_at: string;
  updated_at: string;
}
