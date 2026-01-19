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

  const from = req.body.From;
  const body = req.body.Body;

  if (!from || !body) {
    twiml.message("Please send a valid message.");
    return res.type("text/xml").send(twiml.toString());
  }

  const msg = body.trim().toLowerCase();

  if (!sessions[from]) {
    sessions[from] = { step: "MAIN_MENU" };
  }

  const session = sessions[from];

  console.log("📩 Incoming:", from, msg, session.step);

  /* ---------------- MAIN MENU ---------------- */
  if (msg === "hi" || msg === "menu") {
    session.step = "MAIN_MENU";
    twiml.message(
      "👋 *Welcome!*\n\n" +
      "Choose an option:\n\n" +
      "1️⃣ Book Appointment\n" +
      "2️⃣ Support / Issue\n" +
      "3️⃣ Sales Enquiry\n" +
      "4️⃣ Talk to Human\n\n" +
      "Reply with a number."
    );
  }

  /* ---------------- APPOINTMENT ---------------- */
  else if (session.step === "MAIN_MENU" && msg === "1") {
    session.step = "APPOINTMENT_TYPE";
    twiml.message(
      "📅 *Appointment Type*\n\n" +
      "1️⃣ Consultation\n" +
      "2️⃣ Demo\n" +
      "3️⃣ Support Meeting"
    );
  }

  else if (session.step === "APPOINTMENT_TYPE") {
    session.appointmentType = msg;
    session.step = "APPOINTMENT_DATE";
    twiml.message("📆 Enter preferred date (DD-MM-YYYY)");
  }

  else if (session.step === "APPOINTMENT_DATE") {
    session.date = msg;
    session.step = "APPOINTMENT_TIME";
    twiml.message("⏰ Enter preferred time (e.g. 11:30 AM)");
  }

  else if (session.step === "APPOINTMENT_TIME") {
    const appointmentId = "APT-" + Date.now().toString().slice(-6);

    twiml.message(
      "✅ *Appointment Confirmed*\n\n" +
      `🆔 ID: ${appointmentId}\n` +
      `📅 Date: ${session.date}\n` +
      `⏰ Time: ${msg}\n\n` +
      "Type *menu* to return."
    );

    sessions[from] = { step: "MAIN_MENU" };
  }

  /* ---------------- SUPPORT ---------------- */
  else if (session.step === "MAIN_MENU" && msg === "2") {
    session.step = "SUPPORT_DESC";
    twiml.message("📝 Please describe your issue.");
  }

  else if (session.step === "SUPPORT_DESC") {
    const ticketId = "TKT-" + Date.now().toString().slice(-6);

    twiml.message(
      "🎫 *Ticket Created*\n\n" +
      `🆔 Ticket ID: ${ticketId}\n\n` +
      "Our team will contact you.\n\n" +
      "Type *menu* to return."
    );

    sessions[from] = { step: "MAIN_MENU" };
  }

  /* ---------------- SALES ---------------- */
  else if (session.step === "MAIN_MENU" && msg === "3") {
    twiml.message(
      "📈 *Sales Enquiry*\n\n" +
      "📧 sales@example.com\n" +
      "📞 +91 98765 43210\n\n" +
      "Type *menu* to return."
    );
  }

  /* ---------------- HUMAN ---------------- */
  else if (session.step === "MAIN_MENU" && msg === "4") {
    twiml.message(
      "👤 Our executive will contact you shortly.\n\n" +
      "Type *menu* to return."
    );
  }

  /* ---------------- FALLBACK ---------------- */
  else {
    twiml.message("❓ Please type *menu* to start.");
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Bot running on port ${PORT}`);
});
