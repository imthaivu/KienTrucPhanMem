const express = require("express");
const amqp = require("amqplib");

const app = express();
app.use(express.json());

const RABBITMQ_URL = "amqp://user:password@rabbitmq:5672";
const QUEUE = "order_queue";
const DEAD_LETTER_QUEUE = "order_queue.dlq";

let channel;
let isConnected = false;

async function connectRabbitMQ() {
  while (true) {
    try {
      const conn = await amqp.connect(RABBITMQ_URL);
      channel = await conn.createChannel();
      
      // Ensure DLQ exists first
      await channel.assertQueue(DEAD_LETTER_QUEUE, { durable: true });
      
      // Main queue with DLQ binding
      await channel.assertQueue(QUEUE, {
        durable: true,
        deadLetterExchange: "",      // Default Exchange
        deadLetterRoutingKey: DEAD_LETTER_QUEUE,
      });

      isConnected = true;
      console.log("Producer connected to RabbitMQ");
      console.log(`Main Queue: ${QUEUE}, Dead Letter Queue: ${DEAD_LETTER_QUEUE}`);
      break;
    } catch (err) {
      isConnected = false;
      console.log("Waiting for RabbitMQ...", err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

// Health check endpoint
app.get("/health", (req, res) => {
  if (!isConnected) {
    return res.status(503).json({ status: "disconnected", message: "Producer is not connected to RabbitMQ" });
  }
  res.json({ 
    status: "ok", 
    message: "Producer is connected to RabbitMQ",
    queues: {
      main: QUEUE,
      dlq: DEAD_LETTER_QUEUE
    }
  });
});

// Send message endpoint
app.post("/send", async (req, res) => {
  if (!isConnected) {
    return res.status(503).json({ error: "Producer is not connected to RabbitMQ" });
  }

  const { message, orderId } = req.body;

  if (!message || !orderId) {
    return res.status(400).json({ 
      error: "message and orderId are required",
      requiredFields: ["message", "orderId"]
    });
  }

  const data = {
    message: message,
    orderId: orderId,
    timestamp: new Date(),
    id: "msg_" + Date.now()
  };

  try {
    channel.sendToQueue(
        QUEUE,
        Buffer.from(JSON.stringify(data)),
        { persistent: true }
    );

    console.log("[SEND] Message sent:", data);

    res.json({
      status: "sent",
      message: "Message sent successfully",
      dataSent: data
    });
  } catch (err) {
    console.error("[SEND] Error:", err);
    res.status(500).json({ error: "Failed to send message", details: err.message });
  }
});

// Test Case 1: Valid message (should be processed successfully)
app.post("/test/valid-order", async (req, res) => {
  if (!isConnected) {
    return res.status(503).json({ error: "Producer is not connected to RabbitMQ" });
  }

  const data = {
    message: "Valid order processing",
    orderId: "ORDER_" + Date.now(),
    timestamp: new Date(),
    id: "valid_" + Date.now()
  };

  try {
    channel.sendToQueue(
        QUEUE,
        Buffer.from(JSON.stringify(data)),
        { persistent: true }
    );

    console.log("[TEST CASE 1] Valid order sent:", data);

    res.json({
      testCase: "Test Case 1: Valid Order",
      status: "sent",
      message: "Valid order sent to main queue",
      dataSent: data,
      expectedResult: "Consumer processes successfully → ACK → Message removed from queue",
      observeIn: "Consumer logs should show 'Process success'",
      postmanInstructions: {
        method: "POST",
        url: "http://localhost:3000/test/valid-order",
        body: "Empty (no body needed)"
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to send test message", details: err.message });
  }
});

// Test Case 2: Invalid message - Missing orderId (should go to DLQ)
app.post("/test/invalid-order-missing-id", async (req, res) => {
  if (!isConnected) {
    return res.status(503).json({ error: "Producer is not connected to RabbitMQ" });
  }

  const data = {
    message: "This order has no ID - will be rejected",
    // orderId is intentionally missing!
    timestamp: new Date(),
    id: "invalid_" + Date.now()
  };

  try {
    channel.sendToQueue(
        QUEUE,
        Buffer.from(JSON.stringify(data)),
        { persistent: true }
    );

    console.log("[TEST CASE 2] Invalid order (missing orderId) sent:", data);

    res.json({
      testCase: "Test Case 2: Invalid Order - Missing orderId",
      status: "sent",
      message: "Invalid message sent to main queue (missing orderId)",
      dataSent: data,
      expectedResult: "Consumer detects missing orderId → NACK → Message moves to DLQ",
      observeIn: "Consumer logs should show 'Send to DLQ'",
      checkDLQ: `Monitor RabbitMQ Management UI for messages in queue: ${DEAD_LETTER_QUEUE}`,
      postmanInstructions: {
        method: "POST",
        url: "http://localhost:3000/test/invalid-order-missing-id",
        body: "Empty (no body needed)"
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to send test message", details: err.message });
  }
});

// Test Case 3: Invalid message - Malformed JSON
app.post("/test/invalid-json", async (req, res) => {
  if (!isConnected) {
    return res.status(503).json({ error: "Producer is not connected to RabbitMQ" });
  }

  const malformedJSON = "{invalid json format}";
  const id = "invalid_json_" + Date.now();

  try {
    channel.sendToQueue(
        QUEUE,
        Buffer.from(malformedJSON),
        { persistent: true }
    );

    console.log("[TEST CASE 3] Malformed JSON sent:", malformedJSON);

    res.json({
      testCase: "Test Case 3: Invalid Message - Malformed JSON",
      status: "sent",
      message: "Malformed JSON sent to queue",
      dataSent: malformedJSON,
      expectedResult: "Consumer fails to parse JSON → Error thrown → NACK → Message to DLQ",
      observeIn: "Consumer logs should show parsing error and 'Send to DLQ'",
      postmanInstructions: {
        method: "POST",
        url: "http://localhost:3000/test/invalid-json",
        body: "Empty (no body needed)"
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to send test message", details: err.message });
  }
});

// Test Case 4: Bulk valid orders
app.post("/test/bulk-valid-orders", async (req, res) => {
  if (!isConnected) {
    return res.status(503).json({ error: "Producer is not connected to RabbitMQ" });
  }

  const count = req.body.count || 3;
  const sentMessages = [];

  try {
    for (let i = 1; i <= count; i++) {
      const data = {
        message: `Bulk valid order #${i}`,
        orderId: "BULK_ORDER_" + Date.now() + "_" + i,
        timestamp: new Date(),
        id: "bulk_valid_" + Date.now() + "_" + i
      };

      channel.sendToQueue(
          QUEUE,
          Buffer.from(JSON.stringify(data)),
          { persistent: true }
      );

      sentMessages.push(data);
      console.log(`[TEST CASE 4] Bulk valid order ${i}/${count}:`, data);
    }

    res.json({
      testCase: "Test Case 4: Bulk Valid Orders",
      status: "sent",
      message: `${count} valid orders sent to queue`,
      totalSent: count,
      dataSent: sentMessages,
      expectedResult: `Consumer should process all ${count} orders successfully with 3-second delay each`,
      observeIn: "Consumer logs should show all orders processed successfully",
      postmanInstructions: {
        method: "POST",
        url: "http://localhost:3000/test/bulk-valid-orders",
        body: { count: 3 }
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to send bulk messages", details: err.message });
  }
});

// Info endpoint - Show all available test cases
app.get("/test-cases", (req, res) => {
  res.json({
    description: "RabbitMQ DLQ Test Cases Guide",
    baseUrl: "http://localhost:3000",
    testCases: [
      {
        name: "Test Case 1: Valid Order",
        endpoint: "POST /test/valid-order",
        body: {},
        description: "Send valid order with orderId - Should process successfully"
      },
      {
        name: "Test Case 2: Invalid Order (Missing orderId)",
        endpoint: "POST /test/invalid-order-missing-id",
        body: {},
        description: "Send order without orderId - Should go to DLQ"
      },
      {
        name: "Test Case 3: Invalid JSON",
        endpoint: "POST /test/invalid-json",
        body: {},
        description: "Send malformed JSON - Should go to DLQ"
      },
      {
        name: "Test Case 4: Bulk Valid Orders",
        endpoint: "POST /test/bulk-valid-orders",
        body: { count: 3 },
        description: "Send multiple valid orders at once"
      }
    ]
  });
});

connectRabbitMQ();

app.listen(3000, () => {
  console.log("Producer API listening on port 3000");
});
