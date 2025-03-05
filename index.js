const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
require("dotenv").config();
// const chalk = require("chalk");
const app = express().use(body_parser.json());
const SEND_REQ_TOKEN = process.env.SEND_REQ_TOKEN;
const VERIFY_WEBHOOK = process.env.VERIFY_WEBHOOK;

app.listen(8000 || process.env.PORT, () => {
  console.log("⚡ Server start");
});

app.get("/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let challenge = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_WEBHOOK) {
      res.status(200).send(challenge);
    } else {
      res.send(403);
    }
  }
});

app.post("/webhook", (req, res) => {
  let body = req.body;
  console.log(JSON.stringify(body, null, 2));
  if (body.object) {
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0].value.message &&
      body.entry[0].changes[0].vaue.message[0]
    ) {
      let phone_number_id =
        body.entry[0].challenge[0].value.metadata.phone_number_id;
      let from = body.entry[0].changes[0].value.messages[0].from;
      let msg_body = body.entry[0].changes[0].value.messages[0].text.body;

      axios({
        method: "POST",
        url:
          "https://graph.facebook.com/v22.0/" +
          phone_number_id +
          "/messages?access_token=" +
          SEND_REQ_TOKEN,
        data: {
          messaging_product: "whatsapp",
          to: from,
          type: "template",
          text: {
            body: "Unga bunga let's goooooooooo",
          },
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  }
});

app.get("/", (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quicli Backend</title>
      <style>
        :root {
          --primary: #8b5cf6;
          --success: #10b981;
          --dark: #121212;
          --darker: #0a0a0a;
          --light: #e2e8f0;
          --card: #1a1a1a;
          --text: #f8fafc;
          --text-secondary: #94a3b8;
          --shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.5;
          margin: 0;
          padding: 0;
          background-color: var(--darker);
          color: var(--text);
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .container {
          width: 85%;
          max-width: 700px;
          background-color: var(--dark);
          padding: 1.8rem;
          border-radius: 12px;
          box-shadow: var(--shadow);
        }
        h1 {
          color: var(--primary);
          text-align: center;
          margin-bottom: 1.2rem;
          font-weight: 600;
          font-size: 1.8rem;
          letter-spacing: -0.5px;
        }
        h2 {
          font-size: 1.1rem;
          font-weight: 500;
          margin-top: 1.5rem;
          margin-bottom: 0.8rem;
          color: var(--light);
          letter-spacing: -0.3px;
        }
        .status {
          padding: 0.8rem 1rem;
          background-color: rgba(16, 185, 129, 0.08);
          border-left: 3px solid var(--success);
          margin-bottom: 1.5rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
        }
        .status p {
          margin: 0;
          display: flex;
          align-items: center;
          font-weight: 500;
          font-size: 0.9rem;
          color: var(--success);
        }
        .status p::before {
          content: "";
          display: inline-block;
          width: 8px;
          height: 8px;
          background-color: var(--success);
          border-radius: 50%;
          margin-right: 8px;
          box-shadow: 0 0 6px var(--success);
        }
        .endpoints {
          margin-top: 1.5rem;
        }
        .endpoint {
          background-color: var(--card);
          padding: 0.9rem;
          margin-bottom: 0.8rem;
          border-radius: 6px;
          border-left: 3px solid var(--primary);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .endpoint:hover {
          transform: translateY(-2px);
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
        }
        .method {
          font-weight: 600;
          color: var(--primary);
          background-color: rgba(139, 92, 246, 0.1);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          letter-spacing: 0.5px;
        }
        .endpoint p {
          margin: 0.4rem 0;
          font-size: 0.9rem;
        }
        footer {
          text-align: center;
          margin-top: 1.8rem;
          color: var(--text-secondary);
          font-size: 0.8rem;
          padding-top: 0.8rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
      </style>
    </head>
    <body>
      <div class="container">
        
        <div class="status">
          <p>Server is running properly</p>
        </div>
        <div class="endpoints">
          <h2>Available Endpoints</h2>
          <div class="endpoint">
            <p><span class="method">GET</span> /</p>
            <p>This page - Server status</p>
          </div>
          <div class="endpoint">
            <p><span class="method">POST</span> /webhook</p>
            <p>WhatsApp webhook endpoint</p>
          </div>
        </div>
        <footer>
          <p>Quicli Backend v1.0.0</p>
        </footer>
      </div>
    </body>
    </html>
    `);
});
