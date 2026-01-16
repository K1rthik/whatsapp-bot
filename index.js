import express from "express";
import axios from "axios";

const app = express();

// REQUIRED for Meta + Railway
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const VERIFY_TOKEN = "verify_token_123";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.PHONE_NUMBER_ID;

// Health check (VERY IMPORTANT)
app.get("/", (req, res) => {
  res.send("WhatsApp bot is running ✅");
});

// Webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // Browser test fallback
  if (!mode) {
    return res.status(200).send("Webhook endpoint is live ✅");
  }

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Receive messages
app.post("/webhook", async (req, res) => {
  try {
    const msg =
      req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (msg?.text?.body) {
      await axios.post(
        `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: msg.from,
          text: { body: "Hi 👋 Meta WhatsApp bot is working!" }
        },
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err.response?.data || err.message);
    res.sendStatus(200);
  }
});

// Railway-safe port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Bot running on port", PORT);
});
