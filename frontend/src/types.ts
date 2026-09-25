export type Category = {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  _count?: { products: number };
};

export type Product = {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: string | number;
  imageUrl: string | null;
  stock: number;
  active: boolean;
  categoryId: number;
  category: Category;
};

export type Customer = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  active: boolean;
  _count?: { orders: number };
};

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export type OrderItem = {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: string | number;
  subtotal: string | number;
  product: Product;
};

export type Order = {
  id: number;
  customerId: number;
  status: OrderStatus;
  total: string | number;
  notes: string | null;
  createdAt: string;
  customer: Customer;
  items?: OrderItem[];
  _count?: { items: number };
};

