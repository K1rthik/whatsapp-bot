import express from "express";
import twilio from "twilio";

const app = express();
const { MessagingResponse } = twilio.twiml;

app.use(express.urlencoded({ extended: false }));

/* ---------------- MEMORY ---------------- */
const sessions = {};
const tickets = [];

/* ---------------- HEALTH ---------------- */
app.get("/", (req, res) => {
  res.send("✅ KGISL WhatsApp Support Bot is running");
});

/* ---------------- WEBHOOK ---------------- */
app.post("/whatsapp", (req, res) => {
  const twiml = new MessagingResponse();
  const from = req.body.From;
  const body = req.body.Body;

  if (!body) {
    res.type("text/xml");
    return res.send(twiml.toString());
  }

  const msg = body.trim().toLowerCase();

  if (!sessions[from]) {
    sessions[from] = { step: "MENU" };
  }

  const s = sessions[from];

  console.log("📩", from, msg, s.step);

  /* ---------- MAIN MENU ---------- */
  if (msg === "hi" || msg === "menu") {
    s.step = "MENU";
    twiml.message(
      "👋 * KGISL Support*\n\n" +
      "1️⃣ Raise New Ticket\n" +
      "2️⃣ My Tickets\n" +
      "3️⃣ Book Appointment\n" +
      "4️⃣ Contact Support\n\n" +
      "Reply with a number"
    );
  }

  /* ---------- RAISE TICKET ---------- */
  else if (s.step === "MENU" && msg === "1") {
    s.step = "TICKET_SUMMARY";
    twiml.message("📝 Please describe your issue briefly");
  }

  else if (s.step === "TICKET_SUMMARY") {
    const id = "SR-" + Date.now().toString().slice(-6);
    tickets.push({ id, from, summary: msg });

    twiml.message(
      "✅ *Ticket Created*\n\n" +
      `🎫 Ticket ID: *${id}*\n\n` +
      "Our team will contact you.\n\n" +
      "Type *menu* to return"
    );

    s.step = "MENU";
  }

  /* ---------- MY TICKETS ---------- */
  else if (s.step === "MENU" && msg === "2") {
    if (tickets.length === 0) {
      twiml.message("📂 No tickets found.\n\nType *menu*");
    } else {
      let text = "📂 *My Tickets*\n\n";
      tickets.forEach((t, i) => {
        text += `${i + 1}. ${t.id} – ${t.summary}\n`;
      });
      text += "\nType *menu*";
      twiml.message(text);
    }
  }

  /* ---------- APPOINTMENT ---------- */
  else if (s.step === "MENU" && msg === "3") {
    s.step = "APPOINT_DATE";
    twiml.message("📆 Enter appointment date (DD-MM-YYYY)");
  }

  else if (s.step === "APPOINT_DATE") {
    s.date = msg;
    s.step = "APPOINT_TIME";
    twiml.message("⏰ Enter appointment time (e.g. 11:30 AM)");
  }

  else if (s.step === "APPOINT_TIME") {
    const id = "APT-" + Date.now().toString().slice(-6);
    twiml.message(
      "✅ *Appointment Booked*\n\n" +
      `📅 ID: ${id}\n` +
      `📆 Date: ${s.date}\n` +
      `⏰ Time: ${msg}\n\n` +
      "Type *menu*"
    );
    s.step = "MENU";
  }

  /* ---------- CONTACT ---------- */
  else if (s.step === "MENU" && msg === "4") {
    twiml.message(
      "📞 *Contact Support*\n\n" +
      "📧 support@kgisl.com\n" +
      "📱 +91 99523 41032\n\n" +
      "Type *menu*"
    );
  }

  /* ---------- FALLBACK ---------- */
  else {
    twiml.message("❓ Invalid input. Type *menu*");
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

/* ---------------- PORT ---------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Bot running on port ${PORT}`);
});
