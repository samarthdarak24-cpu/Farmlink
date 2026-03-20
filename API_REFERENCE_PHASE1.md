# Phase 1 MVP - API Reference

## Orders Management API

### 1. Create Order (with automatic stock reduction)
```
POST /api/orders
Authorization: Bearer {jwt_token}

Request Body:
{
  "farmerId": "farmer_user_id",
  "productId": "product_id",
  "quantity": 5,
  "price": 100
}

Response (201):
{
  "_id": "order_id",
  "buyerId": "buyer_user_id",
  "farmerId": "farmer_user_id",
  "productId": "product_id",
  "quantity": 5,
  "price": 100,
  "totalAmount": 500,
  "status": "pending",
  "paymentStatus": "pending",
  "timeline": [
    {
      "status": "pending",
      "timestamp": "2026-03-20T...",
      "updatedBy": "buyer_user_id",
      "notes": "Order created"
    }
  ],
  "createdAt": "2026-03-20T...",
  "updatedAt": "2026-03-20T..."
}

Errors:
- 401: Authentication required
- 403: Only buyers can create orders
- 400: Insufficient stock / Missing fields
```

### 2. Get User's Orders
```
GET /api/orders
Authorization: Bearer {jwt_token}

Response (200): Array of orders filtered by user role
- Buyers see their created orders
- Farmers see orders for their products

Query Parameters (optional):
- status: filter by order status (pending, accepted, shipped, delivered, cancelled)
- limit: limit results
- skip: pagination offset
```

### 3. Get Order by ID
```
GET /api/orders/{orderId}

Response (200): Single order object
```

### 4. Update Order Status
```
PUT /api/orders/{orderId}/status
Authorization: Bearer {jwt_token}

Request Body:
{
  "status": "accepted|rejected|shipped|delivered",
  "notes": "Optional update notes"
}

Valid Status Transitions:
- pending → accepted, rejected, cancelled
- accepted → shipped, cancelled
- shipped → delivered
- delivered → (terminal)

Response (200): Updated order with new timeline entry
```

### 5. Cancel Order
```
POST /api/orders/{orderId}/cancel
Authorization: Bearer {jwt_token}

Response (200): Order with status "cancelled"
Note: Can only cancel orders in "pending" or "accepted" status
```

---

## Inventory Management API

### 1. Get Inventory Transaction Logs
```
GET /api/orders/inventory/logs/{productId}
Authorization: Bearer {jwt_token} (Farmer only)

Response (200): Array of inventory transactions
[
  {
    "_id": "log_id",
    "productId": "product_id",
    "farmerId": "farmer_id",
    "transactionType": "order|adjustment|restock",
    "quantityChange": -5,
    "previousQuantity": 100,
    "currentQuantity": 95,
    "relatedOrderId": "order_id",
    "notes": "Order 123 created",
    "createdAt": "2026-03-20T..."
  }
]

Errors:
- 401: Authentication required
- 403: Only farmers can view
```

### 2. Get Stock Alerts (All)
```
GET /api/orders/inventory/alerts
Authorization: Bearer {jwt_token} (Farmer only)

Response (200): Array of all alerts (active + resolved)
[
  {
    "_id": "alert_id",
    "productId": "product_id",
    "farmerId": "farmer_id",
    "productName": "Rice",
    "currentStock": 5,
    "thresholdLevel": 10,
    "alertType": "low-stock|out-of-stock",
    "status": "active|resolved",
    "acknowledgedAt": null,
    "createdAt": "2026-03-20T...",
    "updatedAt": "2026-03-20T..."
  }
]
```

### 3. Get Active Stock Alerts Only
```
GET /api/orders/inventory/alerts/active
Authorization: Bearer {jwt_token} (Farmer only)

Response (200): Array of active alerts only
```

### 4. Acknowledge Stock Alert
```
PUT /api/orders/inventory/alerts/{alertId}/acknowledge
Authorization: Bearer {jwt_token} (Farmer only)

Response (200): Updated alert with status "resolved"
```

### 5. Manual Inventory Adjustment (Restock)
```
POST /api/orders/inventory/adjust
Authorization: Bearer {jwt_token} (Farmer only)

Request Body:
{
  "productId": "product_id",
  "quantityAdjustment": 50,  // positive for restock, negative for adjustment
  "notes": "Restocked from warehouse"
}

Response (200):
{
  "message": "Inventory adjusted successfully",
  "product": {
    "id": "product_id",
    "name": "Rice",
    "previousQuantity": 5,
    "currentQuantity": 55,
    "adjustment": 50
  }
}

Auto-resolves:
- Low-stock alerts when stock > 10
- Out-of-stock alerts when stock > 0
```

### 6. Get Inventory Dashboard Summary
```
GET /api/orders/inventory/summary
Authorization: Bearer {jwt_token} (Farmer only)

Response (200):
{
  "totalProducts": 15,
  "totalStock": 245,
  "outOfStockCount": 2,
  "lowStockCount": 3,
  "activeAlertsCount": 5,
  "products": [
    {
      "id": "product_id",
      "name": "Rice",
      "quantity": 5,
      "status": "low-stock|out-of-stock|in-stock"
    },
    ...
  ]
}
```

---

## Real-time Chat API

### 1. Get Conversations
```
GET /api/messages/conversations
Authorization: Bearer {jwt_token}

Response (200): Array of user's conversations
[
  {
    "_id": "conversation_id",
    "participants": ["user_id_1", "user_id_2"],
    "orderId": "order_id",
    "rfqId": "rfq_id",
    "lastMessage": "Hello",
    "lastMessageAt": "2026-03-20T...",
    "createdAt": "2026-03-20T..."
  }
]
```

### 2. Start New Conversation
```
POST /api/messages/start
Authorization: Bearer {jwt_token}

Request Body:
{
  "recipientId": "user_id",
  "initialMessage": "Hi, interested in your rice",
  "orderId": "order_id",  // optional
  "rfqId": "rfq_id"       // optional
}

Response (201): New conversation object
```

### 3. Get Messages in Conversation
```
GET /api/messages/{conversationId}
Authorization: Bearer {jwt_token}

Response (200): Array of messages in chronological order
[
  {
    "_id": "message_id",
    "conversationId": "conversation_id",
    "senderId": "user_id",
    "recipientId": "user_id",
    "content": "Are you available?",
    "isRead": true,
    "readAt": "2026-03-20T...",
    "isDelivered": true,
    "deliveredAt": "2026-03-20T...",
    "createdAt": "2026-03-20T..."
  }
]
```

### 4. Send Message
```
POST /api/messages/{conversationId}
Authorization: Bearer {jwt_token}

Request Body:
{
  "content": "Yes, available now",
  "recipientId": "user_id"  // optional, can infer from conversation
}

Response (201): Message object
```

### 5. Mark Message as Read
```
PUT /api/messages/{messageId}/read
Authorization: Bearer {jwt_token}

Response (200): Updated message with isRead: true
```

### 6. Get Conversation Stats
```
GET /api/messages/{conversationId}/stats
Authorization: Bearer {jwt_token}

Response (200):
{
  "unreadCount": 3,
  "totalMessages": 25,
  "lastMessageAt": "2026-03-20T..."
}
```

---

## RFQ (Request for Quotation) API

### 1. Create RFQ (Buyer only)
```
POST /api/rfqs
Authorization: Bearer {jwt_token}

Request Body:
{
  "productCategory": "Rice",
  "productName": "Basmati Rice",
  "quantity": 100,
  "unit": "kg",
  "targetPrice": 50,
  "deliveryLocation": "Mumbai, India",
  "notes": "Need high quality"
}

Response (201): RFQ object
```

### 2. Get All Open RFQs
```
GET /api/rfqs
Authorization: Bearer {jwt_token}

Query Parameters:
- status: open|closed|awarded
- category: product category

Response (200): Array of RFQs
```

### 3. Respond to RFQ (Farmer only)
```
POST /api/rfqs/{rfqId}/respond
Authorization: Bearer {jwt_token}

Request Body:
{
  "quantity": 100,
  "pricePerUnit": 45,
  "deliveryDays": 7,
  "notes": "Can deliver within a week",
  "farmerName": "Arjun Farms"
}

Response (200): Updated RFQ with new response
```

### 4. Close RFQ (Buyer only)
```
PUT /api/rfqs/{rfqId}/close
Authorization: Bearer {jwt_token}

Response (200): RFQ with status "closed"
```

### 5. Award RFQ (Buyer only)
```
PUT /api/rfqs/{rfqId}/award/{responseId}
Authorization: Bearer {jwt_token}

Response (200): RFQ with status "awarded" and selectedResponseId set
```

---

## WebSocket Events (Real-time)

### Connection
```javascript
socket.on('connect', () => {
  socket.emit('authenticate', userId);
});
```

### Send Message
```javascript
socket.emit('send-message', {
  recipientId: 'user_id',
  message: 'Hello',
  conversationId: 'conversation_id'
});

// Listen for response
socket.on('new-message', (data) => {
  console.log('Message received:', data);
});
```

### Order Update
```javascript
socket.emit('order_update', {
  recipientId: 'user_id',
  order: { id: '...', status: 'shipped' },
  orderId: 'order_id'
});

socket.on('order_update', (data) => {
  console.log('Order updated:', data);
});
```

### Proposal Update
```javascript
socket.emit('proposal_update', {
  recipientId: 'user_id',
  proposal: { price: 45, quantity: 100 },
  rfqId: 'rfq_id'
});

socket.on('proposal_update', (data) => {
  console.log('Proposal received:', data);
});
```

### Typing Indicator
```javascript
socket.emit('typing', {
  conversationId: 'conversation_id',
  userId: 'user_id'
});

socket.on('user-typing', (data) => {
  console.log('User is typing...');
});
```

---

## Error Response Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Missing fields, invalid data |
| 401 | Unauthorized | Missing/invalid auth token |
| 403 | Forbidden | Wrong role, not the resource owner |
| 404 | Not Found | Order/product/conversation doesn't exist |
| 500 | Server Error | Database issue, unexpected error |

---

## MongoDB Collections Created

1. **orders** - Order documents with full audit trail
2. **products** - Product listings
3. **conversations** - User conversation threads  
4. **messages** - Message history
5. **rfqs** - Request for Quotation with farmer responses
6. **inventorylogs** - Stock transaction history
7. **stockalerts** - Stock alerts (low/out-of-stock)
8. **users** - User accounts
