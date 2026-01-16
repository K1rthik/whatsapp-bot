import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();

/**
 * REQUIRED middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ENV VARIABLES
 */
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

/**
 * HEALTH CHECK (IMPORTANT)
 */
app.get("/", (req, res) => {
  res.status(200).send("✅ WhatsApp bot is running");
});

/**
 * WEBHOOK VERIFICATION (Meta)
 */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // Browser test
  if (!mode) {
    return res.status(200).send("Webhook endpoint is live ✅");
  }

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  }

  console.error("❌ Webhook verification failed");
  return res.sendStatus(403);
});

/**
 * RECEIVE WHATSAPP MESSAGES
 */
app.post("/webhook", async (req, res) => {
  try {
    const message =
      req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

    const from = message.from;
    const text = message.text?.body;

    if (text) {
      console.log("📩 Message received:", text);

      await axios.post(
        `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: `Hi 👋\nYou said: "${text}"\n\nMeta WhatsApp bot is working ✅`
          }
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(
      "❌ Error:",
      error.response?.data || error.message
    );
    res.sendStatus(200);
  }
});

/**
 * START SERVER (Railway safe)
 */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Bot running on port ${PORT}`);
});
