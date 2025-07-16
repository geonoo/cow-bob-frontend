export interface Driver {
  id: number;
  name: string;
  phoneNumber: string;
  vehicleNumber: string;
  vehicleType: string;
  tonnage: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_VACATION';
  joinDate: string;
  vacations?: Vacation[];
  deliveries?: Delivery[];
}

export interface Delivery {
  id: number;
  destination: string;
  address: string;
  price: number;
  deliveryDate: string;
  driver?: Driver;
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface Vacation {
  id: number;
  driver: Driver;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
}

export interface DeliveryRecommendation {
  delivery: Delivery;
  recommendedDriver?: Driver;
  message?: string;
}