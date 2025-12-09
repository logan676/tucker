# Tucker Database Design

## Overview

Tucker uses PostgreSQL as the primary database with normalized design and JSONB for flexible data where appropriate.

## ER Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │   Address   │       │   Merchant  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │       │ id (PK)     │
│ phone       │  │    │ user_id(FK) │───────│ name        │
│ name        │  └────│ name        │       │ category_id │──┐
│ avatar      │       │ phone       │       │ rating      │  │
│ created_at  │       │ province    │       │ status      │  │
└─────────────┘       │ city        │       │ location    │  │
                      │ district    │       └─────────────┘  │
                      │ detail      │              │         │
                      │ is_default  │              │         │
                      └─────────────┘              │         │
                                                   │         │
┌─────────────┐       ┌─────────────┐       ┌──────▼──────┐  │
│   Order     │       │ OrderItem   │       │   Product   │  │
├─────────────┤       ├─────────────┤       ├─────────────┤  │
│ id (PK)     │──┐    │ id (PK)     │       │ id (PK)     │  │
│ user_id(FK) │  │    │ order_id(FK)│───────│merchant_id  │──┘
│merchant_id  │  └────│ product_id  │       │ name        │
│ total_amount│       │ quantity    │       │ price       │
│ status      │       │ price       │       │ category    │
│ address     │       │ options     │       │ is_available│
└─────────────┘       └─────────────┘       └─────────────┘

┌─────────────┐       ┌─────────────┐
│   Review    │       │   Coupon    │
├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │
│ user_id(FK) │       │ name        │
│merchant_id  │       │ type        │
│ order_id(FK)│       │ value       │
│ rating      │       │ min_amount  │
│ content     │       │ valid_until │
└─────────────┘       └─────────────┘
```

## Table Definitions

### users - User Table

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(50),
    avatar          VARCHAR(500),
    membership_level INTEGER DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at      TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_phone ON users(phone);
```

### addresses - Delivery Address Table

```sql
CREATE TABLE addresses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id),
    label       VARCHAR(20),                    -- Home, Office, etc.
    name        VARCHAR(50) NOT NULL,           -- Recipient name
    phone       VARCHAR(20) NOT NULL,           -- Recipient phone
    province    VARCHAR(50) NOT NULL,
    city        VARCHAR(50) NOT NULL,
    district    VARCHAR(50) NOT NULL,
    detail      VARCHAR(200) NOT NULL,          -- Detailed address
    location    POINT,                          -- Coordinates
    is_default  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at  TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);
```

### categories - Merchant Category Table

```sql
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50) NOT NULL,
    icon        VARCHAR(500),
    sort_order  INTEGER DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### merchants - Merchant Table

```sql
CREATE TABLE merchants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    logo            VARCHAR(500),
    banner          VARCHAR(500),
    category_id     UUID REFERENCES categories(id),
    description     TEXT,
    phone           VARCHAR(20),

    -- Rating & Sales
    rating          DECIMAL(2,1) DEFAULT 5.0,
    rating_count    INTEGER DEFAULT 0,
    monthly_sales   INTEGER DEFAULT 0,

    -- Delivery Info
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    delivery_fee    DECIMAL(10,2) DEFAULT 0,
    delivery_time   VARCHAR(50),                -- Estimated delivery time

    -- Location
    province        VARCHAR(50),
    city            VARCHAR(50),
    district        VARCHAR(50),
    address         VARCHAR(200),
    location        POINT,                      -- Coordinates (lng, lat)

    -- Business Info
    business_hours  JSONB,                      -- [{start: "09:00", end: "22:00"}]
    features        VARCHAR(50)[],              -- Tags: Dine-in, Pickup, etc.

    -- Status
    status          VARCHAR(20) DEFAULT 'pending', -- pending/active/suspended/closed
    is_open         BOOLEAN DEFAULT TRUE,

    owner_id        UUID,                       -- Merchant admin
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at      TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_merchants_category ON merchants(category_id);
CREATE INDEX idx_merchants_status ON merchants(status);
CREATE INDEX idx_merchants_location ON merchants USING GIST(location);
```

### product_categories - Product Category Table

```sql
CREATE TABLE product_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    name        VARCHAR(50) NOT NULL,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_categories_merchant ON product_categories(merchant_id);
```

### products - Product Table

```sql
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id     UUID NOT NULL REFERENCES merchants(id),
    category_id     UUID REFERENCES product_categories(id),
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    image           VARCHAR(500),
    images          VARCHAR(500)[],

    price           DECIMAL(10,2) NOT NULL,
    original_price  DECIMAL(10,2),              -- Original price (strikethrough)

    monthly_sales   INTEGER DEFAULT 0,
    likes           INTEGER DEFAULT 0,

    -- Options
    options         JSONB,                      -- [{name: "Size", required: true, items: [{name: "Large", price: 5}]}]

    sort_order      INTEGER DEFAULT 0,
    is_available    BOOLEAN DEFAULT TRUE,
    is_recommend    BOOLEAN DEFAULT FALSE,

    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at      TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_products_merchant ON products(merchant_id);
CREATE INDEX idx_products_category ON products(category_id);
```

### orders - Order Table

```sql
CREATE TYPE order_status AS ENUM (
    'pending_payment',  -- Awaiting payment
    'pending_confirm',  -- Awaiting merchant confirmation
    'confirmed',        -- Confirmed
    'preparing',        -- Preparing
    'delivering',       -- Out for delivery
    'completed',        -- Completed
    'cancelled',        -- Cancelled
    'refunded'          -- Refunded
);

CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no        VARCHAR(32) NOT NULL UNIQUE,
    user_id         UUID NOT NULL REFERENCES users(id),
    merchant_id     UUID NOT NULL REFERENCES merchants(id),

    -- Amounts
    total_amount    DECIMAL(10,2) NOT NULL,     -- Product total
    delivery_fee    DECIMAL(10,2) DEFAULT 0,    -- Delivery fee
    pack_fee        DECIMAL(10,2) DEFAULT 0,    -- Packing fee
    discount_amount DECIMAL(10,2) DEFAULT 0,    -- Discount
    pay_amount      DECIMAL(10,2) NOT NULL,     -- Final amount

    -- Delivery Info
    delivery_address JSONB NOT NULL,            -- Snapshot: {name, phone, address, location}
    delivery_type   VARCHAR(20) DEFAULT 'delivery', -- delivery/pickup

    -- Order Info
    remark          TEXT,
    status          order_status DEFAULT 'pending_payment',

    -- Timestamps
    paid_at         TIMESTAMP WITH TIME ZONE,
    confirmed_at    TIMESTAMP WITH TIME ZONE,
    delivered_at    TIMESTAMP WITH TIME ZONE,
    completed_at    TIMESTAMP WITH TIME ZONE,
    cancelled_at    TIMESTAMP WITH TIME ZONE,
    cancel_reason   VARCHAR(200),

    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_merchant ON orders(merchant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

### order_items - Order Item Table

```sql
CREATE TABLE order_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL REFERENCES orders(id),
    product_id  UUID NOT NULL REFERENCES products(id),

    -- Product Snapshot
    name        VARCHAR(100) NOT NULL,
    image       VARCHAR(500),
    price       DECIMAL(10,2) NOT NULL,
    quantity    INTEGER NOT NULL DEFAULT 1,
    options     VARCHAR(100)[],                 -- Selected options

    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
```

### payments - Payment Table

```sql
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('wechat', 'alipay', 'balance');

CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_no      VARCHAR(64) NOT NULL UNIQUE,
    order_id        UUID NOT NULL REFERENCES orders(id),
    user_id         UUID NOT NULL REFERENCES users(id),

    amount          DECIMAL(10,2) NOT NULL,
    method          payment_method NOT NULL,
    status          payment_status DEFAULT 'pending',

    -- Third-party Payment Info
    trade_no        VARCHAR(64),                -- Third-party transaction ID
    pay_params      JSONB,                      -- Payment params
    callback_data   JSONB,                      -- Callback data

    paid_at         TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_user ON payments(user_id);
```

### reviews - Review Table

```sql
CREATE TABLE reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL REFERENCES orders(id) UNIQUE,
    user_id     UUID NOT NULL REFERENCES users(id),
    merchant_id UUID NOT NULL REFERENCES merchants(id),

    rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content     TEXT,
    images      VARCHAR(500)[],

    -- Merchant Reply
    reply       TEXT,
    replied_at  TIMESTAMP WITH TIME ZONE,

    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_merchant ON reviews(merchant_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
```

### coupons - Coupon Table

```sql
CREATE TYPE coupon_type AS ENUM ('fixed', 'percent');

CREATE TABLE coupons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    type            coupon_type NOT NULL,
    value           DECIMAL(10,2) NOT NULL,     -- Amount or percentage
    min_amount      DECIMAL(10,2) DEFAULT 0,    -- Minimum spend
    max_discount    DECIMAL(10,2),              -- Max discount (for percent)

    merchant_id     UUID REFERENCES merchants(id), -- NULL = platform coupon

    total_count     INTEGER,                    -- Total quantity
    used_count      INTEGER DEFAULT 0,

    valid_from      TIMESTAMP WITH TIME ZONE,
    valid_until     TIMESTAMP WITH TIME ZONE,

    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### user_coupons - User Coupon Table

```sql
CREATE TABLE user_coupons (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id),
    coupon_id   UUID NOT NULL REFERENCES coupons(id),
    order_id    UUID REFERENCES orders(id),     -- Linked when used

    is_used     BOOLEAN DEFAULT FALSE,
    used_at     TIMESTAMP WITH TIME ZONE,
    expire_at   TIMESTAMP WITH TIME ZONE,

    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_coupons_user ON user_coupons(user_id);
```

## Index Strategy

### Query Optimization Indexes

```sql
-- Merchant search (with Elasticsearch)
CREATE INDEX idx_merchants_name_gin ON merchants USING GIN(to_tsvector('simple', name));

-- Order query optimization
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_merchant_status ON orders(merchant_id, status);

-- Product query
CREATE INDEX idx_products_merchant_available ON products(merchant_id, is_available);
```

## Table Partitioning (Large Table Optimization)

```sql
-- Partition orders table by month
CREATE TABLE orders (
    ...
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2024_01 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```
