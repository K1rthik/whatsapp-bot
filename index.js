import express from "express";
import twilio from "twilio";

const { MessagingResponse } = twilio.twiml;
const app = express();

app.use(express.urlencoded({ extended: false }));

// Health check
app.get("/", (req, res) => {
  res.status(200).send("✅ WhatsApp bot is running");
});

// WhatsApp webhook
app.post("/whatsapp", (req, res) => {
  const twiml = new MessagingResponse();
  const incomingMsg = req.body.Body;

  console.log("📩 Raw payload:", req.body);

  if (!incomingMsg) {
    // Ignore delivery/status callbacks
    res.type("text/xml");
    return res.send(twiml.toString());
  }

  const msg = incomingMsg.trim().toLowerCase();
  console.log("📩 Incoming message:", msg);

  if (msg === "hi") {
    twiml.message("Hello 👋\nYour WhatsApp bot is working ✅");
  } else if (msg === "help") {
    twiml.message(
      "Menu:\n" +
      "hi - Greeting\n" +
      "help - Show menu"
    );
  } else {
    twiml.message(`You said: "${msg}"`);
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

// Railway port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
