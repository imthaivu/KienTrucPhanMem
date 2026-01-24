const express = require("express");
const amqp = require("amqplib");

const app = express();
app.use(express.json());

const RABBITMQ_URL = "amqp://user:password@rabbitmq:5672";
const QUEUE = "order_queue";

let channel;
let isConnected = false;

async function connectRabbitMQ() {
  while (true) {
    try {
      const conn = await amqp.connect(RABBITMQ_URL);
      channel = await conn.createChannel();
      await channel.assertQueue(QUEUE);

      isConnected = true;
      console.log("Producer connected to RabbitMQ");
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
  res.json({ status: "ok", message: "Producer is connected to RabbitMQ" });
});

// Send message endpoint
app.post("/send", async (req, res) => {
  if (!isConnected) {
    return res.status(503).json({ error: "Producer is not connected to RabbitMQ" });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  const data = {
    message: message,
    timestamp: new Date(),
    id: Math.random().toString(36).substr(2, 9)
  };

  try {
    channel.sendToQueue(
        QUEUE,
        Buffer.from(JSON.stringify(data)),
        {
          persistent: true // Message không bị mất khi RabbitMQ restart
        }
    );

    console.log("[SEND] Success:", data);

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

// Test Case 1: Send valid message
app.post("/test/valid-message", async (req, res) => {
  if (!isConnected) {
    return res.status(503).json({ error: "Producer is not connected to RabbitMQ" });
  }

  const data = {
    message: "This is a valid test message",
    timestamp: new Date(),
    id: "test_" + Date.now()
  };

  try {
    channel.sendToQueue(
        QUEUE,
        Buffer.from(JSON.stringify(data)),
        { persistent: true }
    );

    console.log("[TEST CASE 1] Valid message sent:", data);

    res.json({
      testCase: "Test Case 1: Valid Message",
      status: "sent",
      message: "Valid message sent successfully to queue",
      dataSent: data,
      expectedResult: "Consumer should process this message successfully and send ACK"
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to send test message", details: err.message });
  }
});

// Test Case 2: Send message with extra data
app.post("/test/message-with-metadata", async (req, res) => {
  if (!isConnected) {
    return res.status(503).json({ error: "Producer is not connected to RabbitMQ" });
  }

  const data = {
    message: "Message with metadata",
    userId: "user_123",
    orderId: "order_456",
    amount: 99.99,
    timestamp: new Date(),
    id: "test_metadata_" + Date.now()
  };

  try {
    channel.sendToQueue(
        QUEUE,
        Buffer.from(JSON.stringify(data)),
        { persistent: true }
    );

    console.log("[TEST CASE 2] Message with metadata sent:", data);

    res.json({
      testCase: "Test Case 2: Message with Metadata",
      status: "sent",
      message: "Message with metadata sent successfully",
      dataSent: data,
      expectedResult: "Consumer should process this message with all metadata fields"
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to send test message", details: err.message });
  }
});

// Test Case 3: Bulk messages
app.post("/test/bulk-messages", async (req, res) => {
  if (!isConnected) {
    return res.status(503).json({ error: "Producer is not connected to RabbitMQ" });
  }

  const count = req.body.count || 5;
  const sentMessages = [];

  try {
    for (let i = 1; i <= count; i++) {
      const data = {
        message: `Bulk message #${i}`,
        batchId: "batch_" + Date.now(),
        index: i,
        timestamp: new Date(),
        id: "bulk_" + Date.now() + "_" + i
      };

      channel.sendToQueue(
          QUEUE,
          Buffer.from(JSON.stringify(data)),
          { persistent: true }
      );

      sentMessages.push(data);
      console.log(`[TEST CASE 3] Bulk message ${i}/${count} sent:`, data);
    }

    res.json({
      testCase: "Test Case 3: Bulk Messages",
      status: "sent",
      message: `${count} messages sent successfully in bulk`,
      totalSent: count,
      dataSent: sentMessages,
      expectedResult: `Consumer should process all ${count} messages in sequence`
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to send bulk messages", details: err.message });
  }
});

// Info endpoint - Show all available test cases
app.get("/test-cases", (req, res) => {
  res.json({
    description: "Basic RabbitMQ Test Cases Guide",
    baseUrl: "http://localhost:3000",
    testCases: [
      {
        name: "Health Check",
        endpoint: "GET /health",
        description: "Check if producer is connected"
      },
      {
        name: "Test Case 1: Valid Message",
        endpoint: "POST /test/valid-message",
        body: {},
        description: "Send a simple valid message"
      },
      {
        name: "Test Case 2: Message with Metadata",
        endpoint: "POST /test/message-with-metadata",
        body: {},
        description: "Send message with additional metadata fields"
      },
      {
        name: "Test Case 3: Bulk Messages",
        endpoint: "POST /test/bulk-messages",
        body: { count: 5 },
        description: "Send multiple messages at once"
      }
    ]
  });
});

connectRabbitMQ();

app.listen(3000, () => {
  console.log("Producer API listening on port 3000");
});
