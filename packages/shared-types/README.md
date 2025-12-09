# Tucker Shared Types

Shared TypeScript type definitions used by API, Web, and Dashboard.

## Usage

```typescript
import { User, Merchant, Order, Product } from '@tucker/shared-types';
```

## Type Definitions

```typescript
// User related
interface User {
  id: string;
  phone: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

interface Address {
  id: string;
  userId: string;
  label: string;        // Home, Office, etc.
  name: string;         // Recipient name
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;       // Detailed address
  isDefault: boolean;
}

// Merchant related
interface Merchant {
  id: string;
  name: string;
  logo: string;
  banner?: string;
  category: string;
  rating: number;
  monthlySales: number;
  minOrderAmount: number;
  deliveryFee: number;
  deliveryTime: string;
  distance?: number;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  features: string[];
  status: 'open' | 'closed' | 'busy';
}

// Product related
interface Product {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  image: string;
  price: number;
  originalPrice?: number;
  category: string;
  monthlySales: number;
  likes: number;
  isAvailable: boolean;
  options?: ProductOption[];
}

interface ProductOption {
  name: string;
  required: boolean;
  items: {
    name: string;
    price: number;
  }[];
}

// Order related
interface Order {
  id: string;
  orderNo: string;
  userId: string;
  merchantId: string;
  merchant: Pick<Merchant, 'id' | 'name' | 'logo'>;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  discountAmount: number;
  payAmount: number;
  status: OrderStatus;
  address: Address;
  remark?: string;
  createdAt: Date;
  paidAt?: Date;
  confirmedAt?: Date;
  deliveredAt?: Date;
  completedAt?: Date;
}

interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  options?: string[];
}

type OrderStatus =
  | 'pending_payment'   // Awaiting payment
  | 'pending_confirm'   // Awaiting confirmation
  | 'preparing'         // Preparing
  | 'delivering'        // Delivering
  | 'completed'         // Completed
  | 'cancelled';        // Cancelled

// Review related
interface Review {
  id: string;
  orderId: string;
  userId: string;
  merchantId: string;
  rating: number;
  content: string;
  images?: string[];
  reply?: string;
  replyAt?: Date;
  createdAt: Date;
}
```
