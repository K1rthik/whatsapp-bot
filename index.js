import express from "express";
import { MessagingResponse } from "twilio";

const app = express();

/**
 * IMPORTANT:
 * Twilio sends data as application/x-www-form-urlencoded
 */
app.use(express.urlencoded({ extended: false }));

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.send("✅ WhatsApp bot is running");
});

/**
 * Twilio WhatsApp Webhook
 */
app.post("/whatsapp", (req, res) => {
  const incomingMsg = req.body.Body?.toLowerCase();
  const twiml = new MessagingResponse();

  console.log("📩 Message received:", incomingMsg);

  if (incomingMsg === "hi") {
    twiml.message(
      "Hello 👋\nYour WhatsApp bot is working correctly ✅"
    );
  } else if (incomingMsg === "help") {
    twiml.message(
      "Type:\nhi – greeting\nhelp – menu"
    );
  } else {
    twiml.message(
      `You said: "${incomingMsg}"`
    );
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

/**
 * Railway PORT
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
