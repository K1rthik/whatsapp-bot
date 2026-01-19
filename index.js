import express from "express";
import twilio from "twilio";

const { MessagingResponse } = twilio.twiml;
const app = express();

app.use(express.urlencoded({ extended: false }));

/* ---------------- IN-MEMORY DATA ---------------- */

// user sessions
const sessions = {};

// dummy ticket store
const tickets = {
  open: [
    { id: "SR/25-26/17618", group: "ICT", priority: "Medium", assignee: "Sharmini Rajendran" },
    { id: "SR/25-26/17621", group: "Electrical", priority: "Medium", assignee: "Raja M" }
  ],
  closed: [
    { id: "SR/25-26/17610", group: "NOC", date: "19/01/2026" }
  ],
  hold: [
    { id: "SR/25-26/17605", reason: "Awaiting HOD approval" }
  ]
};

/* ---------------- HEALTH CHECK ---------------- */

app.get("/", (req, res) => {
  res.send("✅ KGISL WhatsApp Support Desk is running");
});

/* ---------------- WEBHOOK ---------------- */

app.post("/whatsapp", (req, res) => {
  const twiml = new MessagingResponse();
  const from = req.body.From;
  const msg = req.body.Body?.trim().toLowerCase();

  if (!msg) {
    res.type("text/xml");
    return res.send(twiml.toString());
  }

  if (!sessions[from]) sessions[from] = { step: "START" };
  const s = sessions[from];

  console.log("📩", from, msg);

  /* ---------------- MAIN MENU ---------------- */
  if (msg === "hi" || msg === "menu" || s.step === "START") {
    s.step = "MENU";
    twiml.message(
      "👋 *Welcome to KGISL Support Desk*\n\n" +
      "How can I help you today?\n\n" +
      "1️⃣ Raise New Ticket\n" +
      "2️⃣ My Open Tickets\n" +
      "3️⃣ My Closed Tickets\n" +
      "4️⃣ Tickets On Hold\n" +
      "5️⃣ Department Tickets\n" +
      "6️⃣ Knowledge Base\n" +
      "7️⃣ Contact Support"
    );
  }

  /* ---------------- RAISE TICKET ---------------- */
  else if (s.step === "MENU" && msg === "1") {
    s.step = "TASK_GROUP";
    twiml.message(
      "🛠 *Select Task Group*\n\n" +
      "1️⃣ Electrical\n" +
      "2️⃣ Housekeeping\n" +
      "3️⃣ ICT\n" +
      "4️⃣ NOC\n" +
      "5️⃣ Carpentry"
    );
  }

  else if (s.step === "TASK_GROUP") {
    s.taskGroup = msg;
    s.step = "NATURE";
    twiml.message(
      "🔧 *Nature of Work*\n\n" +
      "1️⃣ Repair / Fix\n" +
      "2️⃣ Installation\n" +
      "3️⃣ Relocation\n" +
      "4️⃣ Maintenance\n" +
      "5️⃣ Others"
    );
  }

  else if (s.step === "NATURE") {
    s.nature = msg;
    s.step = "PRIORITY";
    twiml.message(
      "⚠️ *Set Priority*\n\n" +
      "1️⃣ Low\n2️⃣ Medium\n3️⃣ High"
    );
  }

  else if (s.step === "PRIORITY") {
    s.priority = msg;
    s.step = "SUMMARY";
    twiml.message("📝 Please describe the issue briefly.");
  }

  else if (s.step === "SUMMARY") {
    s.summary = msg;
    s.step = "LOCATION";
    twiml.message(
      "📍 *Confirm Location*\n\n" +
      "Campus: KGISL Campus\n" +
      "Building: KGISL Tower\n" +
      "Floor: Second Floor\n" +
      "Wing: Wing A\n" +
      "Room: ICT Department\n\n" +
      "1️⃣ Confirm\n2️⃣ Change Location"
    );
  }

  else if (s.step === "LOCATION") {
    s.step = "CLOSURE";
    twiml.message(
      "📅 Set Expected Closure Date?\n\n1️⃣ Yes\n2️⃣ Skip"
    );
  }

  else if (s.step === "CLOSURE" && msg === "1") {
    s.step = "DATE";
    twiml.message("📆 Enter expected closure date (DD-MM-YYYY)");
  }

  else if (s.step === "DATE" || (s.step === "CLOSURE" && msg === "2")) {
    s.date = msg === "2" ? "Not specified" : msg;
    s.step = "REVIEW";

    twiml.message(
      "📝 *Ticket Summary*\n\n" +
      `Task Group: ${s.taskGroup}\n` +
      `Nature: ${s.nature}\n` +
      `Priority: ${s.priority}\n` +
      `Issue: ${s.summary}\n\n` +
      "1️⃣ Confirm & Create\n2️⃣ Cancel"
    );
  }

  else if (s.step === "REVIEW" && msg === "1") {
    const id = "SR/25-26/" + Math.floor(Math.random() * 90000);
    tickets.open.push({ id, group: s.taskGroup, priority: s.priority });

    twiml.message(
      "✅ *Ticket Created Successfully!*\n\n" +
      `🎫 Ticket No: ${id}\n` +
      "Status: Open\n\n" +
      "Type *menu* to return."
    );

    sessions[from] = { step: "START" };
  }

  /* ---------------- MY OPEN ---------------- */
  else if (s.step === "MENU" && msg === "2") {
    let text = "📂 *My Open Tickets*\n\n";
    tickets.open.forEach((t, i) => {
      text += `${i + 1}️⃣ ${t.id} – ${t.group} – ${t.priority}\n`;
    });
    text += "\nType *menu* to go back.";
    twiml.message(text);
  }

  /* ---------------- MY CLOSED ---------------- */
  else if (s.step === "MENU" && msg === "3") {
    let text = "📁 *My Closed Tickets*\n\n";
    tickets.closed.forEach((t, i) => {
      text += `${i + 1}️⃣ ${t.id} – ${t.group} – Closed\n`;
    });
    text += "\nType *menu* to go back.";
    twiml.message(text);
  }

  /* ---------------- ON HOLD ---------------- */
  else if (s.step === "MENU" && msg === "4") {
    let text = "⏸ *Tickets On Hold*\n\n";
    tickets.hold.forEach((t, i) => {
      text += `${i + 1}️⃣ ${t.id} – ${t.reason}\n`;
    });
    text += "\nType *menu* to go back.";
    twiml.message(text);
  }

  /* ---------------- DEPARTMENT ---------------- */
  else if (s.step === "MENU" && msg === "5") {
    twiml.message(
      "🏢 *Department Tickets – ICT*\n\n" +
      "Open: 12\nClosed: 98\nOn Hold: 4\n\n" +
      "Type *menu* to return."
    );
  }

  /* ---------------- KNOWLEDGE BASE ---------------- */
  else if (s.step === "MENU" && msg === "6") {
    twiml.message(
      "📚 *Knowledge Base*\n\n" +
      "1️⃣ Internet Issues\n" +
      "2️⃣ AC / Electrical\n" +
      "3️⃣ CCTV / Security\n" +
      "4️⃣ Hardware\n\n" +
      "Type *menu* to return."
    );
  }

  /* ---------------- CONTACT ---------------- */
  else if (s.step === "MENU" && msg === "7") {
    twiml.message(
      "📞 *Contact Support*\n\n" +
      "📧 support@kgisl.com\n" +
      "📱 +91 9952341032\n" +
      "⏰ 10 AM – 6 PM\n\n" +
      "Type *menu* to return."
    );
  }

  /* ---------------- FALLBACK ---------------- */
  else {
    twiml.message("❓ Invalid option. Type *menu* to start again.");
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

/* ---------------- PORT ---------------- */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 KGISL WhatsApp Bot running on port ${PORT}`);
});
