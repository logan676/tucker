# Tucker API Documentation

## Overview

Tucker API follows RESTful design principles. All requests and responses use JSON format.

**Base URL:**
- Development: `http://localhost:3000/api/v1`
- Production: `https://api.tucker.com/api/v1`

## Authentication

### Authentication Method

API uses JWT Bearer Token authentication:

```
Authorization: Bearer <access_token>
```

### Token Acquisition

After successful login, returns `accessToken` and `refreshToken`:

```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "expiresIn": 900
}
```

### Token Refresh

When access token expires, use refresh token to obtain a new token.

---

## API Endpoints

### Auth Module

#### Send Verification Code
```
POST /auth/sms/send
```

**Request:**
```json
{
  "phone": "13800138000"
}
```

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "expireIn": 60
  }
}
```

#### Phone Login/Register
```
POST /auth/login/phone
```

**Request:**
```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "expiresIn": 900,
    "user": {
      "id": "user_123",
      "phone": "138****8000",
      "name": "User123",
      "avatar": null
    }
  }
}
```

#### Refresh Token
```
POST /auth/refresh
```

**Request:**
```json
{
  "refreshToken": "eyJhbG..."
}
```

---

### User Module

#### Get Current User Info
```
GET /users/me
```

#### Update User Info
```
PUT /users/me
```

**Request:**
```json
{
  "name": "New Name",
  "avatar": "https://..."
}
```

#### Get Delivery Addresses
```
GET /users/me/addresses
```

#### Add Delivery Address
```
POST /users/me/addresses
```

**Request:**
```json
{
  "name": "John Doe",
  "phone": "13800138000",
  "province": "Beijing",
  "city": "Beijing",
  "district": "Chaoyang",
  "detail": "Wangjing SOHO T1 2001",
  "label": "Office",
  "isDefault": true
}
```

#### Update Delivery Address
```
PUT /users/me/addresses/:id
```

#### Delete Delivery Address
```
DELETE /users/me/addresses/:id
```

---

### Merchant Module

#### Get Merchant List
```
GET /merchants
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lat | number | Yes | Latitude |
| lng | number | Yes | Longitude |
| category | string | No | Category |
| keyword | string | No | Keyword |
| sortBy | string | No | Sort: distance/rating/sales |
| page | number | No | Page number, default 1 |
| pageSize | number | No | Items per page, default 20 |

**Response:**
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "merchant_123",
        "name": "Xinjiang Restaurant (Wangjing)",
        "logo": "https://...",
        "category": "Xinjiang Cuisine",
        "rating": 4.8,
        "monthlySales": 3000,
        "minOrderAmount": 20,
        "deliveryFee": 0,
        "deliveryTime": "~26 min",
        "distance": 998,
        "features": ["Dine-in", "Express Delivery"],
        "status": "open"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100
    }
  }
}
```

#### Get Merchant Details
```
GET /merchants/:id
```

#### Get Merchant Menu
```
GET /merchants/:id/products
```

**Response:**
```json
{
  "code": 0,
  "data": {
    "categories": [
      {
        "id": "cat_1",
        "name": "Signature Dishes",
        "products": [
          {
            "id": "prod_123",
            "name": "Baked Bun (1pc)",
            "description": "Xinjiang specialty",
            "image": "https://...",
            "price": 8.8,
            "originalPrice": 11,
            "monthlySales": 500,
            "likes": 39,
            "isAvailable": true
          }
        ]
      }
    ]
  }
}
```

#### Get Merchant Reviews
```
GET /merchants/:id/reviews
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | all/good/bad/with_image |
| page | number | Page number |
| pageSize | number | Items per page |

---

### Order Module

#### Create Order
```
POST /orders
```

**Request:**
```json
{
  "merchantId": "merchant_123",
  "addressId": "addr_123",
  "items": [
    {
      "productId": "prod_123",
      "quantity": 2,
      "options": ["Large", "Mild Spicy"]
    }
  ],
  "remark": "No cilantro",
  "couponId": "coupon_123"
}
```

**Response:**
```json
{
  "code": 0,
  "data": {
    "orderId": "order_123",
    "orderNo": "202312090001",
    "totalAmount": 52.6,
    "deliveryFee": 5,
    "discountAmount": 10,
    "payAmount": 47.6,
    "payExpireAt": "2023-12-09T12:30:00Z"
  }
}
```

#### Get Order List
```
GET /orders
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Order status |
| page | number | Page number |
| pageSize | number | Items per page |

#### Get Order Details
```
GET /orders/:id
```

#### Cancel Order
```
POST /orders/:id/cancel
```

**Request:**
```json
{
  "reason": "Changed my mind"
}
```

---

### Payment Module

#### Create Payment
```
POST /payments
```

**Request:**
```json
{
  "orderId": "order_123",
  "payMethod": "wechat"
}
```

**Response:**
```json
{
  "code": 0,
  "data": {
    "paymentId": "pay_123",
    "payParams": {
      "appId": "wx...",
      "timeStamp": "1234567890",
      "nonceStr": "...",
      "package": "prepay_id=...",
      "signType": "RSA",
      "paySign": "..."
    }
  }
}
```

#### Query Payment Status
```
GET /payments/:id/status
```

---

### Search Module

#### Search
```
GET /search
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| keyword | string | Keyword |
| lat | number | Latitude |
| lng | number | Longitude |
| type | string | merchant/product |

#### Search Suggestions
```
GET /search/suggest
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| keyword | string | Keyword |

---

## Error Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 10001 | User not found |
| 10002 | Invalid verification code |
| 10003 | Invalid token |
| 10004 | Token expired |
| 20001 | Merchant not found |
| 20002 | Merchant is closed |
| 30001 | Order not found |
| 30002 | Invalid order status |
| 30003 | Product unavailable |
| 30004 | Insufficient stock |
| 40001 | Payment failed |
| 50001 | Internal server error |
| 50002 | Service temporarily unavailable |

## WebSocket

### Order Status Push

**Connection:**
```
wss://api.tucker.com/ws?token=<access_token>
```

**Order Status Update Message:**
```json
{
  "type": "order_status",
  "data": {
    "orderId": "order_123",
    "status": "preparing",
    "message": "Merchant accepted order, preparing now"
  }
}
```
