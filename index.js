import express from "express";
import twilio from "twilio";

const { MessagingResponse } = twilio.twiml;

const app = express();

/**
 * Twilio sends application/x-www-form-urlencoded
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
  const incomingMsg = req.body.Body?.trim().toLowerCase();
  const twiml = new MessagingResponse();

  console.log("📩 Incoming message:", incomingMsg);

  if (incomingMsg === "hi") {
    twiml.message("Hello 👋\nYour WhatsApp bot is working ✅");
  } 
  else if (incomingMsg === "help") {
    twiml.message(
      "Menu:\n" +
      "hi - Greeting\n" +
      "help - Show menu"
    );
  } 
  else {
    twiml.message(`You said: "${incomingMsg}"`);
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

/**
 * Railway-compatible PORT
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
