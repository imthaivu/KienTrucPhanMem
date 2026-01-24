# Postman Testing Guide - RabbitMQ Project

## Setup Kết nối Postman
- **Base URL**: `http://localhost:3000`
- **Header**: `Content-Type: application/json`

---

## 📋 Test Cases - Basic Producer (producer.js)

### 1️⃣ Health Check
**Kiểm tra kết nối Producer với RabbitMQ**

```
Method: GET
URL: http://localhost:3000/health
Body: (trống)
```

**Expected Response (200):**
```json
{
  "status": "ok",
  "message": "Producer is connected to RabbitMQ"
}
```

---

### 2️⃣ Test Case 1: Valid Message
**Gửi một message hợp lệ - Consumer sẽ xử lý thành công**

```
Method: POST
URL: http://localhost:3000/test/valid-message
Body: (trống)
```

**Expected Response:**
```json
{
  "testCase": "Test Case 1: Valid Message",
  "status": "sent",
  "message": "Valid message sent successfully to queue",
  "dataSent": {
    "message": "This is a valid test message",
    "timestamp": "2026-01-24T...",
    "id": "test_1705900123456"
  },
  "expectedResult": "Consumer should process this message successfully and send ACK"
}
```

**Quan sát**: Consumer logs sẽ hiển thị `Processing:` message

---

### 3️⃣ Test Case 2: Message with Metadata
**Gửi message với metadata bổ sung**

```
Method: POST
URL: http://localhost:3000/test/message-with-metadata
Body: (trống)
```

**Expected Response:**
```json
{
  "testCase": "Test Case 2: Message with Metadata",
  "status": "sent",
  "message": "Message with metadata sent successfully",
  "dataSent": {
    "message": "Message with metadata",
    "userId": "user_123",
    "orderId": "order_456",
    "amount": 99.99,
    "timestamp": "...",
    "id": "test_metadata_..."
  }
}
```

**Quan sát**: Consumer logs sẽ hiển thị message với tất cả metadata

---

### 4️⃣ Test Case 3: Bulk Messages
**Gửi nhiều message một lúc**

```
Method: POST
URL: http://localhost:3000/test/bulk-messages
Body:
{
  "count": 5
}
```

**Expected Response:**
```json
{
  "testCase": "Test Case 3: Bulk Messages",
  "status": "sent",
  "message": "5 messages sent successfully in bulk",
  "totalSent": 5,
  "dataSent": [
    { "message": "Bulk message #1", "batchId": "...", ... },
    { "message": "Bulk message #2", "batchId": "...", ... },
    // ... 3 more messages
  ]
}
```

**Quan sát**: Consumer logs sẽ hiển thị tất cả 5 messages được xử lý

---

## 🚨 Test Cases - DLQ Producer (producer_dlq.js)

### 1️⃣ Health Check
**Kiểm tra kết nối và thông tin queues**

```
Method: GET
URL: http://localhost:3000/health
Body: (trống)
```

**Expected Response:**
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

---

### 2️⃣ Test Case 1: Valid Order ✅
**Gửi order hợp lệ - sẽ được xử lý thành công**

```
Method: POST
URL: http://localhost:3000/test/valid-order
Body: (trống)
```

**Expected Response:**
```json
{
  "testCase": "Test Case 1: Valid Order",
  "status": "sent",
  "message": "Valid order sent to main queue",
  "dataSent": {
    "message": "Valid order processing",
    "orderId": "ORDER_1705900123456",
    "timestamp": "...",
    "id": "valid_..."
  },
  "expectedResult": "Consumer processes successfully → ACK → Message removed from queue",
  "observeIn": "Consumer logs should show 'Process success'"
}
```

**Quan sát Consumer logs:**
```
Processing: {"message":"Valid order processing","orderId":"ORDER_...","timestamp":"...","id":"valid_..."}
(3 giây chờ)
Process success
```

**Kết quả**: Message được xóa khỏi queue chính

---

### 3️⃣ Test Case 2: Invalid Order - Missing orderId ❌
**Gửi order thiếu orderId - sẽ bị gửi đến DLQ**

```
Method: POST
URL: http://localhost:3000/test/invalid-order-missing-id
Body: (trống)
```

**Expected Response:**
```json
{
  "testCase": "Test Case 2: Invalid Order - Missing orderId",
  "status": "sent",
  "message": "Invalid message sent to main queue (missing orderId)",
  "dataSent": {
    "message": "This order has no ID - will be rejected",
    "timestamp": "...",
    "id": "invalid_..."
  },
  "expectedResult": "Consumer detects missing orderId → NACK → Message moves to DLQ",
  "observeIn": "Consumer logs should show 'Send to DLQ'",
  "checkDLQ": "Monitor RabbitMQ Management UI for messages in queue: order_queue.dlq"
}
```

**Quan sát Consumer logs:**
```
Processing: {"message":"This order has no ID...","timestamp":"...","id":"invalid_..."}
Send to DLQ
```

**Kết quả**: Message bị chuyển đến Dead Letter Queue

**Kiểm tra DLQ**: Truy cập RabbitMQ Management UI → Queues → `order_queue.dlq`

---

### 4️⃣ Test Case 3: Invalid JSON ❌
**Gửi malformed JSON - Parser sẽ fail**

```
Method: POST
URL: http://localhost:3000/test/invalid-json
Body: (trống)
```

**Expected Response:**
```json
{
  "testCase": "Test Case 3: Invalid Message - Malformed JSON",
  "status": "sent",
  "message": "Malformed JSON sent to queue",
  "dataSent": "{invalid json format}",
  "expectedResult": "Consumer fails to parse JSON → Error thrown → NACK → Message to DLQ"
}
```

**Quan sát Consumer logs:**
```
Processing: {invalid json format}
(JSON parse error - exception caught)
Send to DLQ
```

**Kết quả**: Message chứa JSON không hợp lệ được gửi đến DLQ

---

### 5️⃣ Test Case 4: Bulk Valid Orders
**Gửi nhiều order hợp lệ một lúc**

```
Method: POST
URL: http://localhost:3000/test/bulk-valid-orders
Body:
{
  "count": 3
}
```

**Expected Response:**
```json
{
  "testCase": "Test Case 4: Bulk Valid Orders",
  "status": "sent",
  "message": "3 valid orders sent to queue",
  "totalSent": 3,
  "dataSent": [
    {
      "message": "Bulk valid order #1",
      "orderId": "BULK_ORDER_..._1",
      ...
    },
    {
      "message": "Bulk valid order #2",
      "orderId": "BULK_ORDER_..._2",
      ...
    },
    {
      "message": "Bulk valid order #3",
      "orderId": "BULK_ORDER_..._3",
      ...
    }
  ]
}
```

**Quan sát Consumer logs:**
```
Processing: {"message":"Bulk valid order #1",...}
(3 giây chờ)
Process success
Processing: {"message":"Bulk valid order #2",...}
(3 giây chờ)
Process success
Processing: {"message":"Bulk valid order #3",...}
(3 giây chờ)
Process success
```

**Kết quả**: Tất cả orders được xử lý thành công, không có message nào đi đến DLQ

---

## 📊 Workflow Testing Sequence

### Scenario 1: Basic Flow (producer.js)
1. **Kiểm tra kết nối** → GET `/health`
2. **Gửi message hợp lệ** → POST `/test/valid-message`
3. **Gửi message có metadata** → POST `/test/message-with-metadata`
4. **Gửi bulk messages** → POST `/test/bulk-messages` with `{"count": 10}`

### Scenario 2: DLQ Testing (producer_dlq.js)
1. **Kiểm tra kết nối** → GET `/health`
2. **Test valid order** → POST `/test/valid-order` (mong đợi success)
3. **Test invalid order** → POST `/test/invalid-order-missing-id` (mong đợi DLQ)
4. **Test malformed JSON** → POST `/test/invalid-json` (mong đợi DLQ)
5. **Test bulk orders** → POST `/test/bulk-valid-orders` with `{"count": 5}`
6. **Kiểm tra DLQ** trong RabbitMQ Management UI

---

## 🔧 Debug Tips

### Kiểm tra RabbitMQ Management UI
- **URL**: `http://localhost:15672`
- **Username**: `user`
- **Password**: `password`

**Nơi xem thông tin:**
1. **Queues** → Xem số message trong mỗi queue
2. **order_queue** → Message đang chờ xử lý
3. **order_queue.dlq** → Message bị reject
4. **Connections** → Xem producer/consumer connections

### Docker Logs
```bash
# Producer logs
docker-compose logs -f producer

# Consumer logs
docker-compose logs -f consumer

# RabbitMQ logs
docker-compose logs -f rabbitmq
```

### Error Response Examples

**Connection Error:**
```json
{
  "status": "disconnected",
  "message": "Producer is not connected to RabbitMQ"
}
```

**Validation Error (DLQ):**
```json
{
  "error": "message and orderId are required",
  "requiredFields": ["message", "orderId"]
}
```

---

## ✅ Success Checklist

- [ ] Health check hiển thị `status: "ok"`
- [ ] Valid messages được consumer nhận
- [ ] Consumer logs hiển thị message content
- [ ] Bulk messages đều được xử lý
- [ ] Invalid messages đi đến DLQ (nếu dùng DLQ producer)
- [ ] RabbitMQ Management UI hiển thị queue statistics
- [ ] Không có connection errors trong logs

---

## 🎯 Notes
- Tất cả request đến Producer API đều trả về JSON response
- Consumer có 3-second delay khi xử lý (để dễ quan sát)
- Persistent messages không bị mất khi RabbitMQ restart
- DLQ rất hữu ích để debug message processing errors
