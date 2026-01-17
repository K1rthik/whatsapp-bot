import express from "express";
import twilio from "twilio";

const { MessagingResponse } = twilio.twiml;
const app = express();

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("✅ WhatsApp bot is running");
});

app.post("/whatsapp", (req, res) => {
  const twiml = new MessagingResponse();
  const incomingMsg = req.body.Body;

  if (!incomingMsg) {
    res.type("text/xml");
    return res.send(twiml.toString());
  }

  const msg = incomingMsg.trim().toLowerCase();

  if (msg === "hi") {
    twiml.message("Hello 👋 Your WhatsApp bot is working ✅");
  } else if (msg === "help") {
    twiml.message("Menu:\nhi - Greeting\nhelp - Show menu");
  } else {
    twiml.message(`You said: "${msg}"`);
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
