// backend/src/modules/order/dto/create-order.dto.ts
export type CreateOrderItemDto = {
  menuItemId: string;
  quantity: number;
};

export type CreateOrderDto = {
  restaurantId: string;
  items: CreateOrderItemDto[];
  address: {
    fullName?: string;
    phone?: string;
    line1: string;
    line2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  paymentMethod?: "card" | "cash" | "wallet";
  notes?: string;
};
