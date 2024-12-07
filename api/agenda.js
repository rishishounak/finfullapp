const Agenda = require("agenda");
require("dotenv").config();

const agenda = new Agenda({
  db: { address: process.env.MONGO_URI, collection: "jobs" },
  processEvery: "30 seconds",
});

// Define the email-sending job
agenda.define("send email", async (job) => {
  const { emailList, subject, body } = job.attrs.data;

  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Send email to each recipient in the emailList
  for (const email of emailList) {
    await transporter.sendMail({
      from: `"Your Workflow" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      text: body,
    });
    console.log(`Email sent to ${email}`);
  }
});

module.exports = agenda;
