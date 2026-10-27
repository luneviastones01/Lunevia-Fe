import { createContext, useContext, useState, ReactNode } from "react";

export interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
}

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "date" | "status">) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

// Sample orders for demo
const sampleOrders: Order[] = [
  {
    id: "ORD-001",
    date: "2026-04-05",
    customerName: "Sarah Mitchell",
    email: "sarah@example.com",
    phone: "+1 555-1234",
    address: "456 Oak Street",
    city: "Los Angeles",
    state: "CA",
    zip: "90001",
    country: "United States",
    items: [{ productName: "Blue Lace Agate", quantity: 1, price: 450 }],
    total: 450,
    status: "processing",
  },
  {
    id: "ORD-002",
    date: "2026-04-03",
    customerName: "James Chen",
    email: "james.chen@example.com",
    phone: "+1 555-5678",
    address: "789 Pine Ave",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "United States",
    items: [
      { productName: "Moss Agate Sphere", quantity: 2, price: 320 },
      { productName: "Fire Agate Pendant", quantity: 1, price: 180 },
    ],
    total: 820,
    status: "shipped",
  },
  {
    id: "ORD-003",
    date: "2026-04-07",
    customerName: "Elena Rodriguez",
    email: "elena.r@example.com",
    phone: "+1 555-9012",
    address: "12 Maple Blvd",
    city: "Miami",
    state: "FL",
    zip: "33101",
    country: "United States",
    items: [{ productName: "Crazy Lace Agate Slab", quantity: 1, price: 1200 }],
    total: 1200,
    status: "pending",
  },
];

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(sampleOrders);

  const addOrder = (order: Omit<Order, "id" | "date" | "status">) => {
    const newOrder: Order = {
      ...order,
      id: `ORD-${String(orders.length + 1).padStart(3, "0")}`,
      date: new Date().toISOString().split("T")[0],
      status: "pending",
    };
    setOrders((prev) => [newOrder, ...prev]);
  };

  const updateOrderStatus = (id: string, status: Order["status"]) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateOrderStatus }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}
