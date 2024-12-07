const express = require("express");
const agenda = require("../agenda");
const router = express.Router();

router.post("/create-workflow", async (req, res) => {
  try {
    const { emailList, subject, body, time, delayDays } = req.body;

    // Schedule the initial email
    const startTime = new Date(time); // Convert the input time to Date
    await agenda.schedule(startTime, "send email", { emailList, subject, body });

    // Schedule the follow-up email after the delay
    const followUpTime = new Date(startTime.getTime() + delayDays * 24 * 60 * 60 * 1000);
    await agenda.schedule(followUpTime, "send email", {
      emailList,
      subject: `Follow-up: ${subject}`,
      body: `This is a follow-up to: ${body}`,
    });

    res.status(200).json({ message: "Workflow created successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create workflow" });
  }
});

module.exports = router;
