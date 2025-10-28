export enum WheelerType {
  TWO_WHEELER = 'TWO_WHEELER',
  THREE_WHEELER = 'THREE_WHEELER',
  FOUR_WHEELER = 'FOUR_WHEELER',
  SIX_WHEELER = 'SIX_WHEELER',
  EIGHT_WHEELER = 'EIGHT_WHEELER',
  TEN_WHEELER = 'TEN_WHEELER',
  MULTI_AXLE = 'MULTI_AXLE'
}

export enum VehicleType {
  CAR = 'CAR',
  MOTORCYCLE = 'MOTORCYCLE',
  SCOOTER = 'SCOOTER',
  TRUCK = 'TRUCK',
  BUS = 'BUS',
  AUTO_RICKSHAW = 'AUTO_RICKSHAW',
  TRACTOR = 'TRACTOR',
  TRAILER = 'TRAILER',
  VAN = 'VAN',
  SUV = 'SUV',
  SEDAN = 'SEDAN',
  HATCHBACK = 'HATCHBACK',
  PICKUP_TRUCK = 'PICKUP_TRUCK',
  DELIVERY_VAN = 'DELIVERY_VAN',
  AMBULANCE = 'AMBULANCE',
  FIRE_TRUCK = 'FIRE_TRUCK',
  POLICE_VEHICLE = 'POLICE_VEHICLE',
  SCHOOL_BUS = 'SCHOOL_BUS',
  TAXI = 'TAXI',
  PRIVATE_BUS = 'PRIVATE_BUS',
  GOODS_CARRIER = 'GOODS_CARRIER',
  TANKER = 'TANKER',
  CRANE = 'CRANE',
  EXCAVATOR = 'EXCAVATOR',
  BULLDOZER = 'BULLDOZER',
  OTHER = 'OTHER'
}

export interface Vehicle {
  id?: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  wheelerType: WheelerType;
  vehicleDescription?: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    active: any;
  };
  village?: {
    id: string;
    name: string;
    active: any;
  };
  active: any;
  seatingCapacity?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleFilters {
  vehicleType?: VehicleType;
  wheelerType?: WheelerType;
  active?: boolean;
  search?: string;
}
