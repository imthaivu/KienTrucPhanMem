# 📚 RabbitMQ Testing Documentation

## 📁 Project Structure

```
rabbitmq_nodejs/
├── docker-compose.yml
├── producer/
│   ├── producer.js           # Basic producer with 3 test cases
│   ├── producer_dlq.js       # DLQ producer with 4 test cases
│   ├── package.json
│   └── Dockerfile
├── consumer/
│   ├── consumer.js           # Basic consumer
│   ├── consumer_dlq.js       # DLQ consumer
│   ├── package.json
│   └── Dockerfile
├── POSTMAN_TESTING_GUIDE.md  # Detailed Postman testing guide
├── QUICK_REFERENCE.md        # Quick reference for testing
├── RabbitMQ_Testing.postman_collection.json  # Postman collection
└── README.md
```

---

## 🎯 Overview

### Two Producer Implementations

#### 1️⃣ **Basic Producer** (`producer.js`)
- Simple producer/consumer pattern
- **3 Test Cases**:
  1. Valid Message - Basic test
  2. Message with Metadata - Test with extra data
  3. Bulk Messages - Send multiple messages at once

**Use Case**: Learn basic RabbitMQ messaging

#### 2️⃣ **DLQ Producer** (`producer_dlq.js`)
- Implements Dead Letter Queue pattern
- **4 Test Cases**:
  1. Valid Order - Successful processing
  2. Invalid Order (Missing orderId) - Goes to DLQ
  3. Malformed JSON - Parse error, goes to DLQ
  4. Bulk Valid Orders - Multiple successful orders

**Use Case**: Learn DLQ handling and error recovery

---

## 🚀 Quick Start

### Step 1: Start Docker
```bash
docker-compose up -d
```

### Step 2: Import Postman Collection
1. Open Postman
2. Import `RabbitMQ_Testing.postman_collection.json`
3. Ready to test!

### Step 3: Run Tests
See **[POSTMAN_TESTING_GUIDE.md](POSTMAN_TESTING_GUIDE.md)** for detailed instructions.

---

## 📊 Test Cases Breakdown

### Basic Producer Tests

| # | Test Case | Endpoint | Expected | Observe |
|---|-----------|----------|----------|---------|
| 1 | Valid Message | POST `/test/valid-message` | Message processed | Consumer logs: message content |
| 2 | Message + Metadata | POST `/test/message-with-metadata` | Message with all fields | Console shows metadata |
| 3 | Bulk Messages | POST `/test/bulk-messages?count=5` | All 5 processed | 5 messages in consumer logs |

### DLQ Producer Tests

| # | Test Case | Endpoint | Expected | Observe |
|---|-----------|----------|----------|---------|
| 1 | Valid Order ✅ | POST `/test/valid-order` | "Process success" | Consumer ACKs message |
| 2 | Missing OrderID ❌ | POST `/test/invalid-order-missing-id` | "Send to DLQ" | Message in order_queue.dlq |
| 3 | Malformed JSON ❌ | POST `/test/invalid-json` | "Send to DLQ" | Parse error logged |
| 4 | Bulk Orders ✅ | POST `/test/bulk-valid-orders?count=3` | All 3 success | All ACKed |

---

## 🔄 Message Flow Diagrams

### Basic Flow (Valid Message)
```
┌─────────────┐
│   Producer  │
│  /test/     │
│  valid-msg  │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│   RabbitMQ       │
│  order_queue     │
└──────┬───────────┘
       │
       ▼
┌─────────────────┐
│   Consumer      │
│  ACKs message   │
│ Process success │
└─────────────────┘
```

### DLQ Flow (Invalid Message)
```
┌──────────────────────┐
│     Producer         │
│  /test/invalid-id    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   RabbitMQ Main      │
│   order_queue        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│     Consumer         │
│ Detects missing ID   │
│   NACKs message      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  RabbitMQ DLQ        │
│ order_queue.dlq      │
│ (Message held here)  │
└──────────────────────┘
```

---

## 📋 Response Examples

### Health Check (Basic Producer)
```json
{
  "status": "ok",
  "message": "Producer is connected to RabbitMQ"
}
```

### Health Check (DLQ Producer)
```json
{
  "status": "ok",
  "message": "Producer is connected to RabbitMQ",
  "queues": {
    "main": "order_queue",
    "dlq": "order_queue.dlq"
  }
}
```

### Valid Message Response
```json
{
  "testCase": "Test Case 1: Valid Order",
  "status": "sent",
  "message": "Valid order sent to main queue",
  "dataSent": {
    "message": "Valid order processing",
    "orderId": "ORDER_1234567890",
    "timestamp": "2026-01-24T10:30:45.123Z",
    "id": "valid_1234567890"
  },
  "expectedResult": "Consumer processes successfully → ACK → Message removed from queue",
  "observeIn": "Consumer logs should show 'Process success'"
}
```

### Invalid Message (DLQ) Response
```json
{
  "testCase": "Test Case 2: Invalid Order - Missing orderId",
  "status": "sent",
  "message": "Invalid message sent to main queue (missing orderId)",
  "dataSent": {
    "message": "This order has no ID - will be rejected",
    "timestamp": "2026-01-24T10:30:45.123Z",
    "id": "invalid_1234567890"
  },
  "expectedResult": "Consumer detects missing orderId → NACK → Message moves to DLQ",
  "observeIn": "Consumer logs should show 'Send to DLQ'",
  "checkDLQ": "Monitor RabbitMQ Management UI for messages in queue: order_queue.dlq"
}
```

---

## 🔧 Monitoring & Debugging

### RabbitMQ Management Dashboard
- **URL**: `http://localhost:15672`
- **Credentials**: user / password
- **Check**:
  - Queue message counts
  - Consumer connections
  - Message rates
  - DLQ contents

### Docker Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f producer
docker-compose logs -f consumer
docker-compose logs -f rabbitmq
```

### Consumer Log Output

**Valid Message Processing:**
```
Processing: {"message":"This is a valid test message","timestamp":"...","id":"test_1234567890"}
(3 second wait)
Process success
```

**Invalid Message Processing:**
```
Processing: {"message":"This order has no ID...","timestamp":"...","id":"invalid_1234567890"}
Send to DLQ
```

**Malformed JSON Processing:**
```
Processing: {invalid json format}
(JSON parse error - exception caught)
Send to DLQ
```

---

## 🎓 Learning Path

### Beginner
1. ✅ Run Health Check
2. ✅ Send Valid Message
3. ✅ Watch Consumer Logs
4. ✅ Understand message flow

### Intermediate
1. ✅ Send Bulk Messages
2. ✅ Add Message Metadata
3. ✅ Monitor Queue Status in RabbitMQ UI
4. ✅ Check message persistence

### Advanced
1. ✅ Test DLQ with invalid messages
2. ✅ Understand error handling
3. ✅ Monitor DLQ queue
4. ✅ Analyze message rejections
5. ✅ Test error recovery patterns

---

## 🧪 Testing Scenarios

### Scenario 1: Happy Path
```
1. GET /health → Verify connection
2. POST /test/valid-message → Send message
3. Observe Consumer logs → Verify processing
4. RabbitMQ UI → Verify queue is empty
```

### Scenario 2: Error Handling (DLQ)
```
1. GET /health → Verify both queues exist
2. POST /test/invalid-order-missing-id → Send invalid message
3. Observe Consumer logs → Verify rejection
4. RabbitMQ UI → Verify message in DLQ
```

### Scenario 3: Bulk Processing
```
1. POST /test/bulk-messages → Send 10 messages
2. Observe Consumer logs → Verify all 10 processed
3. Monitor Queue Status → Watch message count decrease
4. Wait for completion → All should be ACKed
```

### Scenario 4: Mixed Success/Failure (DLQ)
```
1. POST /test/valid-order → Send valid order
2. POST /test/invalid-order-missing-id → Send invalid order
3. Observe separate handling
4. Check DLQ → Only invalid message should be there
```

---

## ⚙️ API Endpoints Reference

### Basic Producer (producer.js)

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/health` | - | Connection status |
| POST | `/send` | `{message: string}` | Message sent |
| POST | `/test/valid-message` | - | Valid msg test |
| POST | `/test/message-with-metadata` | - | Metadata test |
| POST | `/test/bulk-messages` | `{count: number}` | Bulk test |
| GET | `/test-cases` | - | All test info |

### DLQ Producer (producer_dlq.js)

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/health` | - | Main + DLQ status |
| POST | `/send` | `{message, orderId}` | Message sent |
| POST | `/test/valid-order` | - | Valid order test |
| POST | `/test/invalid-order-missing-id` | - | Invalid ID test |
| POST | `/test/invalid-json` | - | Malformed JSON test |
| POST | `/test/bulk-valid-orders` | `{count: number}` | Bulk order test |
| GET | `/test-cases` | - | All test info |

---

## 📝 Code Improvements Made

### 1. Connection Status Tracking
- Added `isConnected` flag
- Proper error handling on disconnect

### 2. Health Check Endpoint
- Shows connection status
- Displays queue information (DLQ)
- Returns meaningful responses

### 3. Comprehensive Test Cases
- Clear test case naming
- Expected results in responses
- Instructions for Postman
- Observable behaviors documented

### 4. Error Handling
- Connection validation
- Request body validation
- Detailed error messages
- Try-catch blocks

### 5. Logging
- Clear log messages
- Test case identification
- Timestamp tracking
- Message content logging

---

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 503 "not connected" | Producer not connected | Wait for RabbitMQ, check logs |
| Empty response | Invalid body format | Use correct JSON format |
| Message not in DLQ | Consumer not rejecting | Check orderId validation logic |
| Queue keeps growing | Consumer not running | Start consumer service |
| Postman 404 error | Wrong endpoint | Check endpoint URL spelling |

---

## 📚 Files Overview

### `POSTMAN_TESTING_GUIDE.md`
- Detailed test case instructions
- Request/response examples
- Expected behaviors
- Debugging tips

### `QUICK_REFERENCE.md`
- Quick lookup table
- Command reference
- Checklist format
- Troubleshooting tips

### `RabbitMQ_Testing.postman_collection.json`
- Ready-to-import Postman collection
- All endpoints configured
- All test cases included
- Just import and run!

---

## ✅ Success Criteria

- [ ] Producer connects successfully
- [ ] Health check returns `status: ok`
- [ ] Messages are delivered to queue
- [ ] Consumer processes messages
- [ ] Valid messages are ACKed
- [ ] Invalid messages go to DLQ (DLQ only)
- [ ] Bulk messages processed in order
- [ ] RabbitMQ UI shows queue statistics
- [ ] All logs are clear and informative

---

## 🎯 Next Steps

1. **Import Postman Collection** → `RabbitMQ_Testing.postman_collection.json`
2. **Run Health Check** → Verify connection
3. **Execute Test Cases** → Follow testing guide
4. **Monitor with RabbitMQ UI** → Watch queues
5. **Check Consumer Logs** → Verify processing
6. **Learn DLQ Concepts** → Understand error handling

---

**Happy Testing! 🚀**

For detailed instructions, see:
- [Postman Testing Guide](POSTMAN_TESTING_GUIDE.md)
- [Quick Reference](QUICK_REFERENCE.md)
