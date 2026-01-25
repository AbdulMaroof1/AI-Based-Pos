# POS Service API Documentation

**Base URL**: `http://localhost:3003`

## Overview

The POS Service handles all Point of Sale operations including table management, orders, payments, and Kitchen Order Tickets (KOT).

---

## Table Management

### Create Table
```http
POST /pos/tables
Content-Type: application/json

{
  "branchId": "string",
  "tableNumber": "string",
  "capacity": number,
  "status": "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLEANING" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "branchId": "string",
    "tableNumber": "string",
    "capacity": number,
    "status": "AVAILABLE",
    "currentOrderId": null,
    "createdAt": "2026-01-25T...",
    "updatedAt": "2026-01-25T..."
  }
}
```

### Get Table
```http
GET /pos/tables/:id
```

### Get Tables by Branch
```http
GET /pos/tables/branch/:branchId
```

### Update Table
```http
PUT /pos/tables/:id
Content-Type: application/json

{
  "tableNumber": "string" (optional),
  "capacity": number (optional),
  "status": "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLEANING" (optional)
}
```

### Update Table Status
```http
PUT /pos/tables/:id/status
Content-Type: application/json

{
  "status": "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLEANING"
}
```

### Delete Table
```http
DELETE /pos/tables/:id
```

---

## Order Management

### Create Order
```http
POST /pos/orders
Content-Type: application/json

{
  "branchId": "string",
  "tableId": "string" (optional),
  "orderType": "DINE_IN" | "TAKEAWAY" | "DELIVERY",
  "customerId": "string" (optional),
  "items": [
    {
      "productId": "string",
      "quantity": number,
      "price": number,
      "modifiers": ["string"] (optional),
      "notes": "string" (optional)
    }
  ],
  "notes": "string" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "branchId": "string",
    "tableId": "string | null",
    "orderType": "DINE_IN",
    "status": "PENDING",
    "customerId": "string | null",
    "subtotal": 20.00,
    "tax": 2.00,
    "serviceCharge": 1.00,
    "discount": 0.00,
    "total": 23.00,
    "items": [
      {
        "id": "uuid",
        "orderId": "uuid",
        "productId": "string",
        "quantity": 2,
        "price": 10.00,
        "subtotal": 20.00,
        "modifiers": [],
        "notes": null
      }
    ],
    "createdAt": "2026-01-25T...",
    "updatedAt": "2026-01-25T..."
  }
}
```

### Get Order
```http
GET /pos/orders/:id
```

### Get Orders by Branch
```http
GET /pos/orders/branch/:branchId?status=PENDING
```

**Query Parameters:**
- `status` (optional): Filter by order status

### Update Order Status
```http
PUT /pos/orders/:id/status
Content-Type: application/json

{
  "status": "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "SERVED" | "COMPLETED" | "CANCELLED"
}
```

### Split Bill
```http
POST /pos/orders/split
Content-Type: application/json

{
  "orderId": "uuid",
  "items": ["item-id-1", "item-id-2"]
}
```

**Response:** Returns array of 2 orders (original and new split order)

### Merge Bills
```http
POST /pos/orders/merge
Content-Type: application/json

{
  "orderIds": ["order-id-1", "order-id-2"]
}
```

**Response:** Returns single merged order

### Apply Discount
```http
POST /pos/orders/discount
Content-Type: application/json

{
  "orderId": "uuid",
  "discountType": "PERCENTAGE" | "FIXED",
  "discountValue": number,
  "description": "string" (optional)
}
```

---

## Payment Processing

### Create Payment
```http
POST /pos/payments
Content-Type: application/json

{
  "orderId": "uuid",
  "paymentMethod": "CASH" | "CARD" | "DIGITAL" | "OTHER",
  "amount": number,
  "reference": "string" (optional),
  "notes": "string" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderId": "uuid",
    "paymentMethod": "CASH",
    "amount": 35.00,
    "status": "COMPLETED",
    "reference": null,
    "notes": null,
    "createdAt": "2026-01-25T..."
  }
}
```

### Get Payments by Order
```http
GET /pos/payments/order/:orderId
```

### Get Payment
```http
GET /pos/payments/:id
```

---

## Kitchen Order Tickets (KOT)

### Create KOT
```http
POST /pos/kot
Content-Type: application/json

{
  "orderId": "uuid",
  "kitchenId": "string" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderId": "uuid",
    "kitchenId": "string | null",
    "status": "PENDING",
    "items": [
      {
        "id": "uuid",
        "kotId": "uuid",
        "orderItemId": "uuid",
        "productName": "Product-123",
        "quantity": 2,
        "status": "PENDING"
      }
    ],
    "createdAt": "2026-01-25T...",
    "updatedAt": "2026-01-25T..."
  }
}
```

### Get KOT
```http
GET /pos/kot/:id
```

### Get KOT by Order
```http
GET /pos/kot/order/:orderId
```

### Update KOT Status
```http
PUT /pos/kot/:id/status
Content-Type: application/json

{
  "status": "PENDING" | "PREPARING" | "READY" | "SERVED" | "CANCELLED"
}
```

---

## Enums

### OrderType
- `DINE_IN`
- `TAKEAWAY`
- `DELIVERY`

### OrderStatus
- `PENDING`
- `CONFIRMED`
- `PREPARING`
- `READY`
- `SERVED`
- `COMPLETED`
- `CANCELLED`

### TableStatus
- `AVAILABLE`
- `OCCUPIED`
- `RESERVED`
- `CLEANING`

### PaymentMethod
- `CASH`
- `CARD`
- `DIGITAL`
- `OTHER`

### PaymentStatus
- `PENDING`
- `COMPLETED`
- `FAILED`
- `REFUNDED`

### KotStatus
- `PENDING`
- `PREPARING`
- `READY`
- `SERVED`
- `CANCELLED`

---

## Notes

- All monetary values are in decimal format
- Tax is automatically calculated at 10% of subtotal
- Service charge is automatically calculated at 5% of subtotal
- Orders automatically update table status when created/completed
- Payments automatically update order status to COMPLETED when fully paid
- KOT is automatically generated with all order items when created

