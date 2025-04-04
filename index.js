const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
require("dotenv").config();
// const chalk = require("chalk");
const app = express().use(body_parser.json());
const SEND_REQ_TOKEN = process.env.SEND_REQ_TOKEN;
const VERIFY_WEBHOOK = process.env.VERIFY_WEBHOOK;

console.log("Starting server initialization...");
console.log(
  `VERIFY_WEBHOOK token configured: ${VERIFY_WEBHOOK ? "Yes" : "No"}`
);
console.log(`SEND_REQ_TOKEN configured: ${SEND_REQ_TOKEN ? "Yes" : "No"}`);
app.listen(process.env.PORT, () => {
  console.log("⚡ Server start");
});

// app.listen(8000, () => {
//   console.log("⚡ Server start");
// });

app.get("/flow", (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Flow URL</title>
      <style>
        :root {
          --primary: #8b5cf6;
          --dark: #121212;
          --darker: #0a0a0a;
          --text: #f8fafc;
          --shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: var(--darker);
          color: var(--text);
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
        }
        .container {
          width: 85%;
          max-width: 500px;
          background-color: var(--dark);
          padding: 2rem;
          border-radius: 12px;
          box-shadow: var(--shadow);
          text-align: center;
        }
        h1 {
          color: var(--primary);
          margin-bottom: 1rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Flow URL</h1>
        <p>This is the Flow URL endpoint for WhatsApp integration.</p>
      </div>
    </body>
    </html>
  `);
});

app.get("/webhook", (req, res) => {
  console.log("GET /webhook endpoint hit");
  let mode = req.query["hub.mode"];
  let challenge = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];

  console.log(`Webhook verification request received:`);
  console.log(`- Mode: ${mode}`);
  console.log(`- Token: ${token}`);
  console.log(`- Challenge: ${challenge}`);

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_WEBHOOK) {
      console.log("Webhook verification successful");
      res.status(200).send(challenge);
    } else {
      console.log("Webhook verification failed - invalid token or mode");
      res.send(403);
    }
  } else {
    console.log("Webhook verification failed - missing mode or token");
    res.send(403);
  }
});

console.log("Right above /webhook");
app.post("/webhook", async (req, res) => {
  console.log("SERVER STARTED!!!");
  console.log("POST /webhook endpoint hit");
  let body = req.body;
  console.log("Request body received:");
  console.log(JSON.stringify(body, null, 2));

  if (body.object) {
    console.log("BODY PASSED - Valid object property found");
    console.log(`Object type: ${body.object}`);
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      // body.entry[0].changes[0].value.contacts[0].profile.name
      console.log("BODY DATA PASSED - All required properties exist");
      console.log("Extracting message data...");
      try {
        let phone_number_id =
          body.entry[0].changes[0].value.metadata.phone_number_id;
        let from = body.entry[0].changes[0].value.messages[0].from;
        let msg_body = body.entry[0].changes[0].value.messages[0].text.body;
        console.log(msg_body);
        console.log("BODY DATA PASSED");
        console.log(`Phone Number ID: ${phone_number_id}`);
        console.log(`From: ${from}`);
        console.log(`Message Body: ${msg_body}`);

        console.log("Preparing to send WhatsApp response...");
        console.log(
          `API URL: https://graph.facebook.com/v22.0/${phone_number_id}/messages`
        );

        console.log("===============================================");
        console.log(body.entry[0].changes[0].value.contacts[0].wa_id);
        console.log("===============================================");
        // const short = await axios.get(
        //   `https://ulvis.net/api.php?url=https://quicli.vercel.app?${from}&custom=quicli&private=1`
        // );

        // console.log(short);
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
            // text: {
            //   preview_url: true,
            //   body: `Visit https://quicli.vercel.app?${from} to book a doctor.`,
            // },
            type: "interactive",
            interactive: {
              type: "cta_url",
              header: {
                type: "text",
                text: `Hi ${
                  body.entry[0].changes[0].value.contacts[0].profile.name ||
                  "Human"
                }`,
              },
              body: {
                text: "Book a doctor from the link below.",
              },
              footer: {
                text: "",
              },
              action: {
                name: "cta_url",
                parameters: {
                  display_text: "Health Checkup",
                  url: `https://quicli.vercel.app/checkup#${from}/`,
                },
              },
            },

            // type: "template",
            // template: {
            //   namespace: "your-namespace",
            //   language: {
            //     policy: "deterministic",
            //     code: "your-language-and-locale-code",
            //   },
            //   name: "your-template-name",
            //   components: [
            //     {
            //       type: "header",
            //       parameters: [
            //         {
            //           type: "text",
            //           text: "replacement_text",
            //         },
            //       ],
            //     },
            //     {
            //       type: "body",
            //       parameters: [
            //         {
            //           type: "text",
            //           text: "replacement_text",
            //         },
            //         {
            //           type: "currency",
            //           currency: {
            //             fallback_value: "$100.99",
            //             code: "USD",
            //             amount_1000: 100990,
            //           },
            //         },
            //         {
            //           type: "date_time",
            //           date_time: {
            //             fallback_value: "February 25, 1977",
            //             day_of_week: 5,
            //             day_of_month: 25,
            //             year: 1977,
            //             month: 2,
            //             hour: 15,
            //             minute: 33,
            //             // "timestamp": 1485470276
            //           },
            //         },
            //       ],
            //     },

            //     {
            //       type: "button",
            //       sub_type: "quick_reply",
            //       index: "0",
            //       parameters: [
            //         {
            //           type: "payload",
            //           payload:
            //             "aGlzIHRoaXMgaXMgY29vZHNhc2phZHdpcXdlMGZoIGFTIEZISUQgV1FEV0RT",
            //         },
            //       ],
            //     },
            //     {
            //       type: "button",
            //       sub_type: "url",
            //       index: "1",
            //       parameters: [
            //         {
            //           type: "text",
            //           text: "9rwnB8RbYmPF5t2Mn09x4h",
            //         },
            //       ],
            //     },
            //     {
            //       type: "button",
            //       sub_type: "url",
            //       index: "2",
            //       parameters: [
            //         {
            //           type: "text",
            //           text: "ticket.pdf",
            //         },
            //       ],
            //     },
            //   ],
            // },
          },
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            console.log("WhatsApp API response successful:");
            console.log(JSON.stringify(response.data, null, 2));
          })
          .catch((error) => {
            console.error("WhatsApp API error:");
            console.error(error.response ? error.response.data : error.message);
          });

        console.log("Sending 200 response to webhook request");
        res.sendStatus(200);
      } catch (error) {
        console.error("Error processing webhook data:");
        console.error(error);
        console.log("Sending 500 response due to processing error");
        res.sendStatus(500);
      }
    } else {
      console.log(
        "Required message properties not found in the webhook payload"
      );
      console.log("Sending 404 response");
      res.sendStatus(404);
    }
  } else {
    console.log("Invalid webhook payload - missing 'object' property");
    console.log("Sending 404 response");
    res.sendStatus(404);
  }
});

app.get("/", (req, res) => {
  console.log("GET / endpoint hit - serving status page");
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
  console.log("Status page served successfully");
});

//
