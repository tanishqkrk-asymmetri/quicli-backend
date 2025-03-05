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
