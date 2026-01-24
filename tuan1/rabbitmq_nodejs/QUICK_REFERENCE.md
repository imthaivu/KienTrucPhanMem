# Quick Reference - RabbitMQ Testing

## 🚀 Để bắt đầu

### 1. Khởi động Docker
```bash
docker-compose up -d
```

### 2. Import Postman Collection
- Mở Postman
- Click **Import** (Ctrl + O)
- Chọn file: `RabbitMQ_Testing.postman_collection.json`
- Click **Import**

### 3. Chạy các Test Cases

---

## 📌 Test Cases Summary

### **BASIC PRODUCER** (port 3000)
| Test Case | Endpoint | Body | Kết quả |
|-----------|----------|------|--------|
| Health Check | GET `/health` | - | ✅ Connected |
| Valid Message | POST `/test/valid-message` | {} | ✅ Process success |
| Message + Metadata | POST `/test/message-with-metadata` | {} | ✅ With all fields |
| Bulk Messages | POST `/test/bulk-messages` | `{"count": 5}` | ✅ All processed |

### **DLQ PRODUCER** (port 3000)
| Test Case | Endpoint | Body | Kết quả |
|-----------|----------|------|--------|
| Health Check | GET `/health` | - | ✅ Main + DLQ queues |
| Valid Order | POST `/test/valid-order` | {} | ✅ Process success |
| Missing OrderID | POST `/test/invalid-order-missing-id` | {} | ❌ → DLQ |
| Malformed JSON | POST `/test/invalid-json` | {} | ❌ → DLQ |
| Bulk Valid Orders | POST `/test/bulk-valid-orders` | `{"count": 3}` | ✅ All success |

---

## 🔍 Monitoring

### RabbitMQ Management UI
**URL**: `http://localhost:15672`
- **User**: `user`
- **Pass**: `password`

**Kiểm tra Queue Status:**
1. Menu → **Queues**
2. **order_queue** → Messages đang xử lý
3. **order_queue.dlq** → Messages bị reject

### Docker Logs
```bash
# Producer logs
docker-compose logs -f producer

# Consumer logs
docker-compose logs -f consumer

# Tất cả
docker-compose logs -f
```

---

## 📊 Expected Behaviors

### Valid Message Flow ✅
```
Producer → POST /test/valid-order
         → Message to order_queue
         → Consumer receives message
         → Consumer ACKs message
         → Message removed from queue
```

### Invalid Message Flow ❌ (DLQ only)
```
Producer → POST /test/invalid-order-missing-id
        → Message to order_queue
        → Consumer rejects (missing orderId)
        → Consumer NACKs message
        → Message moved to order_queue.dlq
        → Stays in DLQ for analysis
```

---

## 🎯 Testing Checklist

- [ ] **Setup**: Docker running
- [ ] **Postman**: Collection imported
- [ ] **Health Check**: Returns `status: ok`
- [ ] **Valid Message**: Processed successfully
- [ ] **Invalid Message**: Goes to DLQ (if DLQ producer)
- [ ] **RabbitMQ UI**: Shows queue statistics
- [ ] **Consumer Logs**: Show all processing steps

---

## 💡 Tips

### For DLQ Testing
1. Run valid-order test first → Consumer processes
2. Check consumer logs → Should see "Process success"
3. Run invalid-order-missing-id test → Consumer rejects
4. Check consumer logs → Should see "Send to DLQ"
5. Go to RabbitMQ UI → Check DLQ queue
6. You'll see the rejected message in DLQ

### Bulk Testing
- **Valid**: 10 messages should all be processed
- **Invalid**: Even 1 invalid message should go to DLQ

### Performance
- Consumer has 3-second delay per message
- Bulk of 5 messages = ~15 seconds total

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Producer not connecting | Check `docker-compose logs rabbitmq` |
| Queue is empty | Producer might not be running |
| DLQ has no messages | Check if consumer is actually rejecting |
| Postman returns 503 | Producer not connected to RabbitMQ |

---

## 📝 Request Body Examples

### Bulk Messages
```json
{
  "count": 10
}
```

### Custom Message (Basic Producer)
```json
{
  "message": "Your message here"
}
```

### Custom Order (DLQ Producer)
```json
{
  "message": "Order description",
  "orderId": "ORDER_123"
}
```

---

## ⚡ Quick Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up -d --build

# Remove everything (including volumes)
docker-compose down -v
```

---

**Last Updated**: 2026-01-24
