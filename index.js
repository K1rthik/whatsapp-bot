import express from "express";
import twilio from "twilio";

const { MessagingResponse } = twilio.twiml;
const app = express();

app.use(express.urlencoded({ extended: false }));

// Simple in-memory sessions
const sessions = {};

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.send("✅ WhatsApp Appointment & Support Bot is running");
});

/**
 * WhatsApp Webhook
 */
app.post("/whatsapp", (req, res) => {
  const twiml = new MessagingResponse();
  const from = req.body.From;
  const incomingMsg = req.body.Body;

  if (!incomingMsg) {
    res.type("text/xml");
    return res.send(twiml.toString());
  }

  const msg = incomingMsg.trim().toLowerCase();

  if (!sessions[from]) {
    sessions[from] = { step: "START" };
  }

  const session = sessions[from];

  console.log("📩", from, msg);

  /* ---------------- MAIN MENU ---------------- */
  if (msg === "hi" || msg === "menu" || session.step === "START") {
    session.step = "MAIN_MENU";
    twiml.message(
      "👋 *Welcome!*\n\n" +
      "Please choose an option:\n\n" +
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
      "📅 *Book Appointment*\n\n" +
      "Choose appointment type:\n\n" +
      "1️⃣ Consultation\n" +
      "2️⃣ Demo\n" +
      "3️⃣ Support Meeting"
    );
  }

  else if (session.step === "APPOINTMENT_TYPE") {
    session.appointmentType = msg;
    session.step = "APPOINTMENT_DATE";
    twiml.message("📆 Please enter preferred *date* (DD-MM-YYYY)");
  }

  else if (session.step === "APPOINTMENT_DATE") {
    session.date = msg;
    session.step = "APPOINTMENT_TIME";
    twiml.message("⏰ Please enter preferred *time* (e.g. 11:30 AM)");
  }

  else if (session.step === "APPOINTMENT_TIME") {
    const appointmentId = "APT-" + Date.now().toString().slice(-6);

    console.log("📅 Appointment Created:", {
      appointmentId,
      from,
      type: session.appointmentType,
      date: session.date,
      time: msg,
    });

    twiml.message(
      "✅ *Appointment Confirmed!*\n\n" +
      `📅 Appointment ID: *${appointmentId}*\n` +
      `📆 Date: ${session.date}\n` +
      `⏰ Time: ${msg}\n\n` +
      "Our team will contact you.\n\n" +
      "Type *menu* to go back."
    );

    sessions[from] = { step: "START" };
  }

  /* ---------------- SUPPORT / TICKET ---------------- */
  else if (session.step === "MAIN_MENU" && msg === "2") {
    session.step = "SUPPORT_TYPE";
    twiml.message(
      "🎫 *Support / Issue*\n\n" +
      "Choose issue type:\n\n" +
      "1️⃣ Technical Issue\n" +
      "2️⃣ Billing Issue\n" +
      "3️⃣ Account Issue\n" +
      "4️⃣ Other"
    );
  }

  else if (session.step === "SUPPORT_TYPE") {
    session.issueType = msg;
    session.step = "SUPPORT_DESC";
    twiml.message("📝 Please describe your issue briefly.");
  }

  else if (session.step === "SUPPORT_DESC") {
    const ticketId = "TKT-" + Date.now().toString().slice(-6);

    console.log("🎫 Ticket Created:", {
      ticketId,
      from,
      issueType: session.issueType,
      description: msg,
    });

    twiml.message(
      "✅ *Support Ticket Created!*\n\n" +
      `🎫 Ticket ID: *${ticketId}*\n\n` +
      "Our support team will contact you soon.\n\n" +
      "Type *menu* to go back."
    );

    sessions[from] = { step: "START" };
  }

  /* ---------------- SALES ---------------- */
  else if (session.step === "MAIN_MENU" && msg === "3") {
    twiml.message(
      "📈 *Sales Enquiry*\n\n" +
      "Please contact:\n" +
      "📧 sales@example.com\n" +
      "📱 +91 98765 43210\n\n" +
      "Type *menu* to go back."
    );
  }

  /* ---------------- HUMAN ---------------- */
  else if (session.step === "MAIN_MENU" && msg === "4") {
    twiml.message(
      "👤 *Talk to Human*\n\n" +
      "Our executive will contact you shortly.\n\n" +
      "Type *menu* to go back."
    );
  }

  /* ---------------- FALLBACK ---------------- */
  else {
    twiml.message(
      "🤔 I didn’t understand that.\n\n" +
      "Type *menu* to start again."
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
  console.log(`🚀 Bot running on port ${PORT}`);
});
