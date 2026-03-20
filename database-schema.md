# ODOP Connect - Database Schema

## MongoDB Collections

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed),
  name: String,
  role: String (enum: ['farmer', 'buyer']),
  phone: String,
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    pincode: String
  },
  avatar: String (URL),
  bio: String,
  certifications: [String], // for farmers
  rating: Number (0-5),
  reviewCount: Number,
  verified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  category: String,
  subcategory: String,
  price: Number,
  unit: String (kg, piece, ton, etc.),
  quantity: Number,
  images: [String],
  farmerId: ObjectId (ref: Users),
  farmerName: String,
  location: {
    city: String,
    state: String,
    country: String
  },
  certifications: [String],
  qualityGrade: Number (0-100),
  aiPriceSuggestion: Number,
  blockchainId: String,
  status: String (enum: ['active', 'inactive', 'out-of-stock']),
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  orderNumber: String (unique),
  buyerId: ObjectId (ref: Users),
  farmerId: ObjectId (ref: Users),
  productId: ObjectId (ref: Products),
  items: [{
    productId: ObjectId,
    name: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  totalAmount: Number,
  status: String (enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  paymentStatus: String (enum: ['pending', 'paid', 'refunded', 'failed']),
  paymentMethod: String,
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
    phone: String
  },
  trackingNumber: String,
  estimatedDelivery: Date,
  blockchainTxId: String,
  timeline: [{
    status: String,
    timestamp: Date,
    note: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### RFQs (Request for Quotation) Collection
```javascript
{
  _id: ObjectId,
  rfqNumber: String (unique),
  buyerId: ObjectId (ref: Users),
  title: String,
  description: String,
  category: String,
  products: [{
    name: String,
    quantity: Number,
    unit: String,
    preferredPrice: Number,
    qualityRequirements: String
  }],
  status: String (enum: ['open', 'quoted', 'closed']),
  deliveryLocation: {
    city: String,
    state: String,
    country: String
  },
  deadline: Date,
  responses: [{
    farmerId: ObjectId,
    farmerName: String,
    price: Number,
    note: String,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Messages/Conversations Collection
```javascript
{
  _id: ObjectId,
  participants: [ObjectId], // ref: Users
  lastMessage: {
    content: String,
    senderId: ObjectId,
    timestamp: Date
  },
  createdAt: Date,
  updatedAt: Date
}

// Messages sub-collection or separate collection
{
  _id: ObjectId,
  conversationId: ObjectId,
  senderId: ObjectId,
  content: String,
  attachments: [String],
  read: Boolean,
  createdAt: Date
}
```

### Reviews Collection
```javascript
{
  _id: ObjectId,
  orderId: ObjectId,
  reviewerId: ObjectId (ref: Users),
  revieweeId: ObjectId (ref: Users),
  rating: Number (1-5),
  comment: String,
  photos: [String],
  response: {
    content: String,
    createdAt: Date
  },
  createdAt: Date
}
```

### Notifications Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  type: String (enum: ['order', 'message', 'rfq', 'price_alert', 'system']),
  title: String,
  message: String,
  data: Object,
  read: Boolean,
  createdAt: Date
}
```

### Blockchain Records Collection (for tracking)
```javascript
{
  _id: ObjectId,
  productId: ObjectId,
  transactionHash: String (unique),
  action: String (enum: ['created', 'transferred', 'verified']),
  data: Object,
  previousHash: String,
  timestamp: Date,
  blockNumber: Number
}
```

## Indexes

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.users.createIndex({ location: 1 })

// Products
db.products.createIndex({ farmerId: 1 })
db.products.createIndex({ category: 1 })
db.products.createIndex({ price: 1 })
db.products.createIndex({ location: 1 })
db.products.createIndex({ name: 'text', description: 'text', farmerName: 'text' })

// Orders
db.orders.createIndex({ buyerId: 1 })
db.orders.createIndex({ farmerId: 1 })
db.orders.createIndex({ status: 1 })
db.orders.createIndex({ createdAt: -1 })

// RFQs
db.rfqs.createIndex({ buyerId: 1 })
db.rfqs.createIndex({ status: 1 })

// Messages
db.messages.createIndex({ conversationId: 1 })
db.messages.createIndex({ senderId: 1 })
```