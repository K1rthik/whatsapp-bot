import express from "express";
import twilio from "twilio";

const { MessagingResponse } = twilio.twiml;
const app = express();

app.use(express.urlencoded({ extended: false }));

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.send("✅ WhatsApp chatbot is running");
});

/**
 * WhatsApp Webhook
 */
app.post("/whatsapp", (req, res) => {
  const twiml = new MessagingResponse();
  const incomingMsg = req.body.Body;

  // Ignore empty callbacks
  if (!incomingMsg) {
    res.type("text/xml");
    return res.send(twiml.toString());
  }

  const msg = incomingMsg.trim().toLowerCase();

  console.log("📩 Incoming:", msg);

  /* ---------- MAIN MENU ---------- */
  if (msg === "hi" || msg === "hello" || msg === "menu") {
    twiml.message(
      "👋 *Welcome!*\n\n" +
      "How can I help you today?\n\n" +
      "1️⃣ Services\n" +
      "2️⃣ Pricing\n" +
      "3️⃣ Support\n" +
      "4️⃣ Contact\n" +
      "5️⃣ FAQ\n\n" +
      "Reply with a number or type *menu* anytime."
    );
  }

  /* ---------- SERVICES ---------- */
  else if (msg === "1" || msg.includes("service")) {
    twiml.message(
      "🛠 *Our Services*\n\n" +
      "• Web Development\n" +
      "• Mobile App Development\n" +
      "• WhatsApp Chatbots\n" +
      "• API Integration\n\n" +
      "Type *menu* to go back."
    );
  }

  /* ---------- PRICING ---------- */
  else if (msg === "2" || msg.includes("price")) {
    twiml.message(
      "💰 *Pricing Info*\n\n" +
      "• Basic Bot: ₹5,000\n" +
      "• Business Bot: ₹10,000\n" +
      "• Custom Solutions: Contact us\n\n" +
      "Type *menu* to go back."
    );
  }

  /* ---------- SUPPORT ---------- */
  else if (msg === "3" || msg.includes("support")) {
    twiml.message(
      "🆘 *Support*\n\n" +
      "We’re here to help!\n\n" +
      "📧 Email: support@example.com\n" +
      "⏰ Support hours: 10 AM – 6 PM\n\n" +
      "Type *menu* to go back."
    );
  }

  /* ---------- CONTACT ---------- */
  else if (msg === "4" || msg.includes("contact")) {
    twiml.message(
      "📞 *Contact Us*\n\n" +
      "📱 Phone: +91 98765 43210\n" +
      "📧 Email: contact@example.com\n" +
      "🌐 Website: www.example.com\n\n" +
      "Type *menu* to go back."
    );
  }

  /* ---------- FAQ ---------- */
  else if (msg === "5" || msg.includes("faq")) {
    twiml.message(
      "❓ *Frequently Asked Questions*\n\n" +
      "Q1: Is this bot 24/7?\n" +
      "👉 Yes, always online.\n\n" +
      "Q2: Can I customize it?\n" +
      "👉 Yes, fully customizable.\n\n" +
      "Q3: Is WhatsApp API paid?\n" +
      "👉 Yes, per conversation.\n\n" +
      "Type *menu* to go back."
    );
  }

  /* ---------- FALLBACK ---------- */
  else {
    twiml.message(
      "🤔 Sorry, I didn’t understand that.\n\n" +
      "Type *menu* to see options."
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
  console.log(`🚀 Chatbot running on port ${PORT}`);
});
