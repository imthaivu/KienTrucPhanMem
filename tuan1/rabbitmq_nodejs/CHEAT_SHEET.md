# 🔥 RabbitMQ Testing Cheat Sheet

## 🎬 START HERE

```bash
# Terminal 1: Start everything
docker-compose up -d
```

```
# Browser: RabbitMQ Management
http://localhost:15672
user / password
```

```
# Postman: Import Collection
Import → RabbitMQ_Testing.postman_collection.json
```

---

## 🧪 Test Commands (Postman)

### BASIC PRODUCER
```
1. GET /health
2. POST /test/valid-message (empty body)
3. POST /test/message-with-metadata (empty body)
4. POST /test/bulk-messages ({"count": 5})
```

### DLQ PRODUCER  
```
1. GET /health
2. POST /test/valid-order (empty body) ✅
3. POST /test/invalid-order-missing-id (empty body) ❌→DLQ
4. POST /test/invalid-json (empty body) ❌→DLQ
5. POST /test/bulk-valid-orders ({"count": 3})
```

---

## 📊 EXPECTED RESULTS

| Test | Result | Where to Check |
|------|--------|-----------------|
| Valid Message | ✅ Processed | Consumer logs: "Process success" |
| Invalid (No ID) | ❌ Rejected | RabbitMQ UI: order_queue.dlq |
| Malformed JSON | ❌ Rejected | Consumer logs: "Send to DLQ" |
| Bulk Messages | ✅ All processed | Count matches in logs |

---

## 🔍 MONITORING CHECKLIST

- [ ] **Health Check** → Returns `"status": "ok"`
- [ ] **Consumer Logs** → Shows messages being processed
- [ ] **RabbitMQ UI** → Queue stats update
- [ ] **DLQ Queue** → Shows rejected messages (if DLQ producer)
- [ ] **No Errors** → All services running normally

---

## 🚨 QUICK TROUBLESHOOTING

```
❌ "not connected"
→ Wait 5 sec, retry. Check: docker-compose logs rabbitmq

❌ Empty response
→ Body format wrong. Use: {} or {"count": 5}

❌ Message not in DLQ
→ Check consumer.js validation logic

❌ No consumer output
→ Start consumer: docker-compose up -d consumer
```

---

## 📱 CURL Examples

```bash
# Health check
curl http://localhost:3000/health

# Valid message
curl -X POST http://localhost:3000/test/valid-message

# Bulk messages
curl -X POST http://localhost:3000/test/bulk-messages \
  -H "Content-Type: application/json" \
  -d '{"count": 5}'

# DLQ - Invalid order
curl -X POST http://localhost:3000/test/invalid-order-missing-id
```

---

## 🎯 ENDPOINTS SUMMARY

| Endpoint | Type | Purpose |
|----------|------|---------|
| `/health` | GET | Check connection |
| `/test/valid-message` | POST | Basic test ✅ |
| `/test/message-with-metadata` | POST | Metadata test ✅ |
| `/test/bulk-messages` | POST | Bulk test ✅ |
| `/test/valid-order` | POST | DLQ: Success ✅ |
| `/test/invalid-order-missing-id` | POST | DLQ: Reject ❌ |
| `/test/invalid-json` | POST | DLQ: Error ❌ |
| `/test/bulk-valid-orders` | POST | DLQ: Bulk ✅ |

---

## 🐳 DOCKER COMMANDS

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Logs specific service
docker-compose logs -f producer
docker-compose logs -f consumer
docker-compose logs -f rabbitmq

# Rebuild & start
docker-compose up -d --build

# Clean everything
docker-compose down -v
```

---

## 🖥️ RabbitMQ MANAGEMENT UI

**URL**: http://localhost:15672
**User**: user | **Pass**: password

**Key Pages:**
- **Queues** → See order_queue, order_queue.dlq
- **Connections** → See producer/consumer connections
- **Channels** → Message flow statistics

---

## 📝 CONSUMER LOG PATTERNS

### ✅ Success
```
Processing: {...valid message...}
Process success
```

### ❌ Rejected  
```
Processing: {...invalid message...}
Send to DLQ
```

### ⚠️ Error
```
Processing: {malformed json}
[JSON parse error]
Send to DLQ
```

---

## ⏱️ TIMING

- **Health Check**: Instant
- **Single Message**: 3 seconds (with delay)
- **5 Bulk Messages**: ~15 seconds
- **Consumer Startup**: 3-5 seconds

---

## 🎓 LEARNING LEVELS

### Beginner (5 min)
- Health check
- Send 1 valid message
- Watch consumer logs

### Intermediate (15 min)
- Bulk messages
- Metadata handling
- Queue monitoring

### Advanced (30 min)
- DLQ concepts
- Invalid message handling
- Error recovery patterns

---

## ✨ PRO TIPS

1. **Keep RabbitMQ UI open** → Real-time monitoring
2. **Watch docker logs** → Understand message flow
3. **Try different bulk counts** → Test scalability
4. **Test invalid cases** → Learn error handling
5. **Use Postman history** → Track what you tested

---

## 🎯 YOUR FIRST TEST (2 minutes)

```
1. docker-compose up -d
2. Import Postman collection
3. GET /health → Should return ok
4. POST /test/valid-message
5. Check consumer logs → Should show message
6. ✅ SUCCESS!
```

---

## 📞 QUICK LINKS

- **Testing Guide**: [POSTMAN_TESTING_GUIDE.md](POSTMAN_TESTING_GUIDE.md)
- **Quick Reference**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- **Full Guide**: [TESTING_GUIDE.md](TESTING_GUIDE.md)
- **RabbitMQ UI**: http://localhost:15672
- **Producer API**: http://localhost:3000

---

**Last Updated**: 2026-01-24 | Keep it simple, test thoroughly! 🚀
