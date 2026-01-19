import express from "express";
import twilio from "twilio";

const { MessagingResponse } = twilio.twiml;
const app = express();

app.use(express.urlencoded({ extended: false }));

const sessions = {};

app.get("/", (req, res) => {
  res.send("✅ WhatsApp Appointment & Support Bot is running");
});

app.post("/whatsapp", (req, res) => {
  const twiml = new MessagingResponse();
  console.log("🔥 Webhook HIT", req.body);

  twiml.message("✅ Bot connected successfully");

  res.type("text/xml");
  res.send(twiml.toString());
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Bot running on port ${PORT}`);
});
