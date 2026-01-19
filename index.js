import express from "express";
import twilio from "twilio";

const app = express();
const { MessagingResponse } = twilio.twiml;

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Bot is running");
});

app.post("/whatsapp", (req, res) => {
  console.log("🔥 Webhook HIT");
  console.log(req.body);

  const twiml = new MessagingResponse();
  twiml.message("✅ Bot connected successfully!");

  res.set("Content-Type", "text/xml");
  res.send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server started on port", PORT);
});
