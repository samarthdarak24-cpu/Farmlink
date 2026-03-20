# Phase 1 MVP - Quick Start & Testing Guide

## Overview
Phase 1 MVP implementation is now complete with full data persistence and inventory management.

### What's Implemented
✅ Product CRUD (already complete)
✅ Inventory Tracking with stock reduction and alerts
✅ Order Management with full workflow
✅ Real-time Chat with message persistence

---

## Getting Started

### 1. Ensure Database is Running
```bash
# MongoDB must be running on your system
# Default: mongodb://127.0.0.1:27017/odop
# Or set MONGODB_URI env variable
```

### 2. Install Dependencies (if not done)
```bash
cd backend
npm install
```

### 3. Start Backend Server
```bash
npm run dev
# Server will start on http://localhost:5000
# Socket.io will be available for real-time connections
```

### 4. Verify Connection
```bash
curl http://localhost:5000/health
# Response: {"status":"ok","timestamp":"2026-03-20T..."}
```

---

## Testing Phase 1 Features

### A. Authentication (Required for all tests)

#### Register User
```bash
# Farmer Registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "pass123",
    "name": "John Farmer",
    "role": "farmer"
  }'

# Buyer Registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@example.com",
    "password": "pass123",
    "name": "Jane Buyer",
    "role": "buyer"
  }'
```

#### Login & Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "pass123"
  }'

# Response: {"token": "eyJhbGc..."}
# Use this token in Authorization header for all subsequent requests
```

Save tokens for testing:
```bash
FARMER_TOKEN="<token_from_farmer_login>"
BUYER_TOKEN="<token_from_buyer_login>"
```

---

### B. Product CRUD (Farmer)

#### Create Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -d '{
    "name": "Basmati Rice",
    "description": "Premium long grain rice",
    "category": "Rice",
    "price": 100,
    "unit": "kg",
    "quantity": 500,
    "images": ["https://example.com/rice.jpg"],
    "certifications": ["organic", "fssai"]
  }'

# Response includes productId - save it for further tests
```

#### Get Farmer's Products
```bash
curl http://localhost:5000/api/products \
  -H "Authorization: Bearer $FARMER_TOKEN"
```

---

### C. Inventory Management & Orders

#### Create Order (Buyer) → Stock Reduction (Automatic)
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d '{
    "farmerId": "farmer_user_id",
    "productId": "product_id",
    "quantity": 50,
    "price": 100
  }'

# This automatically:
# 1. Reduces product stock by 50
# 2. Creates inventory log
# 3. Generates alert if stock falls below 10
```

#### Check Inventory Was Reduced
```bash
curl "http://localhost:5000/api/products/product_id" \
  -H "Authorization: Bearer $FARMER_TOKEN"

# quantity should be 450 (500 - 50)
```

#### Get Inventory Logs
```bash
curl "http://localhost:5000/api/orders/inventory/logs/product_id" \
  -H "Authorization: Bearer $FARMER_TOKEN"

# Shows: [{"transactionType": "order", "quantityChange": -50, ...}]
```

#### Get Stock Alerts
```bash
curl http://localhost:5000/api/orders/inventory/alerts \
  -H "Authorization: Bearer $FARMER_TOKEN"

# If stock <= 10, returns low-stock alerts
```

#### Get Inventory Dashboard
```bash
curl http://localhost:5000/api/orders/inventory/summary \
  -H "Authorization: Bearer $FARMER_TOKEN"

# Returns: {
#   "totalProducts": 1,
#   "totalStock": 450,
#   "outOfStockCount": 0,
#   "lowStockCount": 0,
#   "activeAlertsCount": 0,
#   "products": [...]
# }
```

#### Restock Product (Manual Adjustment)
```bash
curl -X POST http://localhost:5000/api/orders/inventory/adjust \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -d '{
    "productId": "product_id",
    "quantityAdjustment": 200,
    "notes": "Received shipment from warehouse"
  }'

# Stock now: 450 + 200 = 650
# Low-stock alerts automatically resolved if applicable
```

---

### D. Order Management

#### Create Multiple Orders to Trigger Alert
```bash
# Create 10 orders of 50 units each to reduce stock from 500 to 0
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/orders \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $BUYER_TOKEN" \
    -d '{
      "farmerId": "farmer_id",
      "productId": "product_id",
      "quantity": 50,
      "price": 100
    }'
done

# After order 5: Low-stock alert generated (stock = 0)
```

#### Update Order Status
```bash
curl -X PUT http://localhost:5000/api/orders/order_id/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -d '{
    "status": "accepted",
    "notes": "Order accepted and processing"
  }'

# Valid transitions: pending → accepted/rejected/cancelled
#                   accepted → shipped/cancelled
#                   shipped → delivered
```

#### Get Farmer's Orders
```bash
curl http://localhost:5000/api/orders \
  -H "Authorization: Bearer $FARMER_TOKEN"

# Shows all orders for this farmer's products
```

#### Cancel Order
```bash
curl -X POST http://localhost:5000/api/orders/order_id/cancel \
  -H "Authorization: Bearer $FARMER_TOKEN"

# Only works if status is "pending" or "accepted"
```

---

### E. Real-time Chat

#### Start Conversation
```bash
curl -X POST http://localhost:5000/api/messages/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d '{
    "recipientId": "farmer_user_id",
    "initialMessage": "Hi, interested in your rice",
    "orderId": "order_id"
  }'

# Response: {"_id": "conversation_id", ...}
```

#### Get Conversations
```bash
curl http://localhost:5000/api/messages/conversations \
  -H "Authorization: Bearer $FARMER_TOKEN"
```

#### Send Message
```bash
curl -X POST http://localhost:5000/api/messages/conversation_id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -d '{
    "content": "Available in 2 days"
  }'
```

#### Get Messages
```bash
curl http://localhost:5000/api/messages/conversation_id \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

#### Mark as Read
```bash
curl -X PUT http://localhost:5000/api/messages/message_id/read \
  -H "Authorization: Bearer $FARMER_TOKEN"
```

---

### F. Real-time Updates via WebSocket

```javascript
// Frontend code example
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Authenticate
socket.emit('authenticate', 'farmer_user_id');

// Listen for new messages
socket.on('new-message', (data) => {
  console.log('New message:', data);
});

// Listen for order updates
socket.on('order_update', (data) => {
  console.log('Order updated:', data);
});

// Send message in real-time
socket.emit('send-message', {
  recipientId: 'buyer_id',
  message: 'When do you need delivery?',
  conversationId: 'conv_id'
});

// Proposal updates
socket.on('proposal_update', (data) => {
  console.log('New proposal:', data);
});
```

---

## Database Verification

### Check Collections Created
```bash
# Using MongoDB CLI
mongo odop

# List collections
show collections

# Check orders
db.orders.find().pretty()

# Check inventory logs
db.inventorylogs.find().pretty()

# Check stock alerts
db.stockalerts.find().pretty()

# Check messages
db.messages.find().pretty()
```

---

## Common Issues & Fixes

### Issue: "Authentication required"
**Fix**: Make sure you're including the Authorization header and using the token from login.

### Issue: "Insufficient stock"
**Fix**: The product quantity must be >= order quantity. Check current stock first.

### Issue: "Only buyers can create orders"
**Fix**: Register with role: "buyer" and use that token.

### Issue: "Only farmers can view alerts"
**Fix**: Use farmer token for inventory endpoints.

### Issue: MongoDB Connection Error
**Fix**: Ensure MongoDB is running:
```bash
# macOS (if installed via brew)
brew services start mongodb-community

# Linux (if installed via apt)
sudo systemctl start mongod

# Windows (if installed as service)
net start MongoDB
```

---

## Performance Notes

- **Stock queries**: Indexed by productId and farmerId (fast)
- **Alert queries**: Indexed by status and farmerId (fast)
- **Message queries**: Sorted by createdAt, finds latest messages quickly
- **WebSocket**: Broadcasts limited to relevant users (efficient)

---

## Next Steps (Phase 2)

When ready to implement Phase 2:
1. **Ratings & Reviews** - Add review model and endpoints
2. **Analytics Dashboard** - Aggregation queries for metrics
3. **Order fulfillment tracking** - Shipping details, delivery proof

For now, Phase 1 MVP is production-ready for:
- Farmers to list products and manage inventory
- Buyers to place orders with real-time stock updates
- Both to communicate via chat
- Automatic alerting on stock issues
