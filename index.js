// import express from "express";
// import twilio from "twilio";

// const { MessagingResponse } = twilio.twiml;
// const app = express();

// app.use(express.urlencoded({ extended: false }));

// /* ---------------- IN-MEMORY DATA ---------------- */

// const sessions = {};

// const tickets = {
//   open: [
//     { id: "SR/25-26/17618", group: "ICT", priority: "Medium", assignee: "Sharmini Rajendran" },
//     { id: "SR/25-26/17621", group: "Electrical", priority: "Medium", assignee: "Raja M" }
//   ],
//   closed: [{ id: "SR/25-26/17610", group: "NOC", date: "19/01/2026" }],
//   hold: [{ id: "SR/25-26/17605", reason: "Awaiting HOD approval" }]
// };

// /* ---------------- HEALTH CHECK ---------------- */

// app.get("/", (req, res) => {
//   res.send("✅ KGISL WhatsApp Support Desk is running");
// });

// /* ---------------- WEBHOOK ---------------- */

// app.post("/whatsapp", (req, res) => {
//   const twiml = new MessagingResponse();
//   const from = req.body.From;
//   const msg = req.body.Body?.trim().toLowerCase();

//   if (!sessions[from]) {
//     sessions[from] = { step: "MENU" };
//   }

//   const s = sessions[from];

//   console.log("📩", from, msg, "STEP:", s.step);

//   /* ---------------- MAIN MENU ---------------- */
//   if (msg === "hi" || msg === "menu") {
//     s.step = "MENU";
//     twiml.message(
//       "👋 *Welcome to KGISL Support Desk*\n\n" +
//       "1️⃣ Raise New Ticket\n" +
//       "2️⃣ My Open Tickets\n" +
//       "3️⃣ My Closed Tickets\n" +
//       "4️⃣ Tickets On Hold\n" +
//       "5️⃣ Department Tickets\n" +
//       "6️⃣ Knowledge Base\n" +
//       "7️⃣ Contact Support\n\n" +
//       "Reply with a number."
//     );
//   }

//   /* ---------------- RAISE TICKET ---------------- */
//   else if (s.step === "MENU" && msg === "1") {
//     s.step = "TASK_GROUP";
//     twiml.message(
//       "🛠 *Select Task Group*\n\n" +
//       "1️⃣ Electrical\n" +
//       "2️⃣ Housekeeping\n" +
//       "3️⃣ ICT\n" +
//       "4️⃣ NOC\n" +
//       "5️⃣ Carpentry"
//     );
//   }

//   else if (s.step === "TASK_GROUP") {
//     s.taskGroup = msg;
//     s.step = "NATURE";
//     twiml.message(
//       "🔧 *Nature of Work*\n\n" +
//       "1️⃣ Repair / Fix\n" +
//       "2️⃣ Installation\n" +
//       "3️⃣ Relocation\n" +
//       "4️⃣ Maintenance\n" +
//       "5️⃣ Others"
//     );
//   }

//   else if (s.step === "NATURE") {
//     s.nature = msg;
//     s.step = "PRIORITY";
//     twiml.message("⚠️ *Set Priority*\n\n1️⃣ Low\n2️⃣ Medium\n3️⃣ High");
//   }

//   else if (s.step === "PRIORITY") {
//     s.priority = msg;
//     s.step = "SUMMARY";
//     twiml.message("📝 Please describe the issue briefly.");
//   }

//   else if (s.step === "SUMMARY") {
//     s.summary = msg;
//     s.step = "CONFIRM";
//     twiml.message(
//       "📋 *Review Ticket*\n\n" +
//       `Group: ${s.taskGroup}\n` +
//       `Nature: ${s.nature}\n` +
//       `Priority: ${s.priority}\n` +
//       `Issue: ${s.summary}\n\n` +
//       "1️⃣ Confirm & Create\n2️⃣ Cancel"
//     );
//   }

//   else if (s.step === "CONFIRM" && msg === "1") {
//     const id = "SR/25-26/" + Math.floor(Math.random() * 90000);
//     tickets.open.push({ id, group: s.taskGroup, priority: s.priority });

//     twiml.message(
//       "✅ *Ticket Created Successfully!*\n\n" +
//       `🎫 Ticket No: ${id}\n` +
//       "Status: Open\n\n" +
//       "Type *menu* to return."
//     );

//     sessions[from] = { step: "MENU" };
//   }

//   else if (s.step === "CONFIRM" && msg === "2") {
//     sessions[from] = { step: "MENU" };
//     twiml.message("❌ Ticket cancelled.\n\nType *menu* to start again.");
//   }

//   /* ---------------- MY OPEN ---------------- */
//   else if (s.step === "MENU" && msg === "2") {
//     let text = "📂 *My Open Tickets*\n\n";
//     tickets.open.forEach((t, i) => {
//       text += `${i + 1}️⃣ ${t.id} – ${t.group} – ${t.priority}\n`;
//     });
//     text += "\nType *menu* to go back.";
//     twiml.message(text);
//   }

//   /* ---------------- MY CLOSED ---------------- */
//   else if (s.step === "MENU" && msg === "3") {
//     let text = "📁 *My Closed Tickets*\n\n";
//     tickets.closed.forEach((t, i) => {
//       text += `${i + 1}️⃣ ${t.id} – ${t.group}\n`;
//     });
//     text += "\nType *menu* to go back.";
//     twiml.message(text);
//   }

//   /* ---------------- ON HOLD ---------------- */
//   else if (s.step === "MENU" && msg === "4") {
//     let text = "⏸ *Tickets On Hold*\n\n";
//     tickets.hold.forEach((t, i) => {
//       text += `${i + 1}️⃣ ${t.id} – ${t.reason}\n`;
//     });
//     text += "\nType *menu* to go back.";
//     twiml.message(text);
//   }

//   /* ---------------- DEPARTMENT ---------------- */
//   else if (s.step === "MENU" && msg === "5") {
//     twiml.message(
//       "🏢 *Department Tickets – ICT*\n\n" +
//       "Open: 12\nClosed: 98\nOn Hold: 4\n\n" +
//       "Type *menu* to return."
//     );
//   }

//   /* ---------------- KNOWLEDGE BASE ---------------- */
//   else if (s.step === "MENU" && msg === "6") {
//     twiml.message(
//       "📚 *Knowledge Base*\n\n" +
//       "1️⃣ Internet Issues\n" +
//       "2️⃣ AC / Electrical\n" +
//       "3️⃣ CCTV / Security\n" +
//       "4️⃣ Hardware\n\n" +
//       "Type *menu* to return."
//     );
//   }

//   /* ---------------- CONTACT ---------------- */
//   else if (s.step === "MENU" && msg === "7") {
//     twiml.message(
//       "📞 *Contact Support*\n\n" +
//       "📧 support@kgisl.com\n" +
//       "📱 +91 9952341032\n" +
//       "⏰ 10 AM – 6 PM\n\n" +
//       "Type *menu* to return."
//     );
//   }

//   /* ---------------- FALLBACK ---------------- */
//   else {
//     twiml.message("❓ Invalid option. Type *menu* to start again.");
//   }

//   res.type("text/xml");
//   res.send(twiml.toString());
// });

// /* ---------------- PORT ---------------- */

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 KGISL WhatsApp Bot running on port ${PORT}`);
// });


/**
 * WhatsApp Cloud API Chatbot
 * Full Webhook Structure
 */




/**
 * WhatsApp Cloud API Chatbot
 * ES Module Version (FIXED)
 */

/**
 * WhatsApp Cloud API Chatbot
 * FINAL FIXED VERSION (Railway + Meta Test Number)
 */

/**
 * WhatsApp Cloud API Bot
 * Railway-compatible FINAL version
 */
// {
//   "name": "whatsapp-twilio-bot",
//   "version": "1.0.0",
//   "type": "module",
//   "main": "index.js",
//   "scripts": {
//     "start": "node index.js"
//   },
//   "engines": {
//     "node": ">=18"
//   },
//   "dependencies": {
//     "express": "^4.22.1",
//     "twilio": "^4.23.0"
//   }
// }
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
app.use(bodyParser.json());

/* =========================
   CONFIG (ENV VARS ONLY)
========================= */
const PORT = process.env.PORT; // 🚨 DO NOT FALLBACK
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "my_verify_token";
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

/* =========================
   SAFETY CHECKS
========================= */
if (!PORT) {
  console.error("❌ PORT not provided by Railway");
}
if (!ACCESS_TOKEN) {
  console.error("❌ ACCESS_TOKEN missing");
}
if (!PHONE_NUMBER_ID) {
  console.error("❌ PHONE_NUMBER_ID missing");
}

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.status(200).send("WhatsApp Bot is running 🚀");
});

/* =========================
   WEBHOOK VERIFICATION
========================= */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

/* =========================
   RECEIVE MESSAGES
========================= */
app.post("/webhook", async (req, res) => {
  try {
    const message =
      req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) return res.sendStatus(200);

    const from = message.from;
    const text = message.text?.body || "";

    console.log("📩 Incoming:", text);

    await sendTemplateMessage(from);

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Webhook handler error:", err.message);
    res.sendStatus(500);
  }
});

/* =========================
   SEND TEMPLATE MESSAGE
========================= */
async function sendTemplateMessage(to) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: "hello_world",
          language: { code: "en_US" }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Template message sent to:", to);
  } catch (error) {
    console.error(
      "❌ Send error:",
      error.response?.data || error.message
    );
  }
}

/* =========================
   START SERVER (CRITICAL)
========================= */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 WhatsApp bot running on port ${PORT}`);
});
