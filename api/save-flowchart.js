const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const nodemailer = require("nodemailer");
const Agenda = require("agenda");
const cors = require('cors');
// app.use(cors({
//   origin: 'http://localhost:3000', // Allow requests from frontend
//   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type'],
// }));
// app.use(bodyParser.json()); 
const app = express();
const PORT = process.env.PORT || 4000;
const serverUrl = `http://localhost:${process.env.PORT || 4000}`;



// app.use(cors());
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: true }));

// app.use(bodyParser.json()); 
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ['https://finfullapp.vercel.app', 'https://*.vercel.app'];
    if (allowedOrigins.includes(origin) || !origin) {  // `!origin` allows no origin during server-side requests
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  // origin: 'https://finfullapp.vercel.app', // Allow requests from frontend
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  headers:{"Content-Type":"application/json"}
}));


async function connectDB() {
  const dbUri = "mongodb+srv://rishishounak:yoman21@cluster0.quxch.mongodb.net/dataemail1?retryWrites=true&w=majority&appName=Cluster0";  // MongoDB URI from environment variables
  await mongoose.connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('MongoDB connected');
}

// MongoDB connection string for Agenda
const agenda = new Agenda({ db: { address: "mongodb+srv://rishishounak:yoman21@cluster0.quxch.mongodb.net/dataemail1?retryWrites=true&w=majority&appName=Cluster0" } });

agenda.on("ready", () => {
  agenda.start();
  console.log("Agenda started!");
});
// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rishishounak@gmail.com", // Replace with your email
    pass: "pios afii nubz nhqm", // Replace with your email app password
  },
});

// Define the email sending job
agenda.define("send-email", async (job) => {
  const { to, subject, body } = job.attrs.data;
  try {
    await transporter.sendMail({
      from: "rishishounak@gmail.com",
      to,
      subject,
      text: body,
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err);
  }
});



// Endpoint to handle flowchart save and email scheduling
module.exports = async function handler (req, res) {
  console.log('this request body is ',req.body);
  const { nodes } = req.body;

  // if (!nodes || nodes.length === 0) {
  //   return res.status(400).json({ message: "Invalid flowchart data" });
  // }
  await connectDB();

      // Initialize Agenda within the request handler
  const agenda = new Agenda({ mongo: mongoose.connection });
  // const agenda = new Agenda({ db: { address: "mongodb+srv://rishishounak:yoman21@cluster0.quxch.mongodb.net/dataemail1?retryWrites=true&w=majority&appName=Cluster0" } });

  const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rishishounak@gmail.com", // Replace with your email
    pass: "pios afii nubz nhqm", // Replace with your email app password
  },
});

// Define the email sending job
agenda.define("send-email", async (job) => {
  const { to, subject, body } = job.attrs.data;
  try {
    await transporter.sendMail({
      from: "rishishounak@gmail.com",
      to,
      subject,
      text: body,
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err);
  }
});
  try {
    // for (const node of nodes) {
    //   if (node.data.label === "Cold Email" && node.data.details) {
    //     const { emails, subject, body, date, time } = node.data.details;
    //     const delayInDays = parseInt(node.data.details.days || "0", 10);

    //     if (!emails || !subject || !body) {
    //       continue; // Skip invalid nodes
    //     }
        posty=req.body
        const{emails, subject, body, date, time,delayInDays}=posty;
        const emailList = emails.split(",").map((email) => email.trim());

        console.log("hello people",emailList);

        // Schedule the initial email
        if (date && time) {
          const sendDate = new Date(`${date}T${time}`);
          for (const email of emailList) {
            await agenda.schedule(sendDate, "send-email", { to: email, subject, body });
          }
        } else {
          for (const email of emailList) {
            await agenda.now("send-email", { to: email, subject, body });
          }
        }

        // Schedule emails with delay
        if (delayInDays > 0) {
          const delayInMilliseconds = delayInDays * 24 * 60 * 60 * 1000;
          const resendDate = new Date(Date.now() + delayInMilliseconds);

          for (const email of emailList) {
            await agenda.schedule(resendDate, "send-email", { to: email, subject, body });
          }
        }
      
    

    res.status(200).json({ message: "Flowchart saved and emails scheduled" });
  } catch (error) {
    console.error("Error scheduling emails:", error);
    res.status(500).json({ message: "Error scheduling emails", error });
  }
};

// Start the Agenda job processing
// agenda.on("ready", () => {
//   agenda.start();
//   console.log("Agenda started!");
// });

// Start the server

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
