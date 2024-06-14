const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
const dialogflow = require('@google-cloud/dialogflow');
const { WebhookClient, Suggestion } = require('dialogflow-fulfillment');
const express = require("express")
const cors = require("cors");
const nodemailer = require('nodemailer')
const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = "AIzaSyCRSMGR4x30fmKVZDUq403NarMyx5fULN8";

const app = express();
app.use(express.json())
app.use(cors());
const PORT = 3002;

async function runChat(queryText) {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 1,
        topK: 0,
        topP: 0.95,
        maxOutputTokens: 50,
    };

    const chat = model.startChat({
        generationConfig,
        history: [
        ],
    });

    const result = await chat.sendMessage(queryText);
    const response = result.response;
    return response.text();
}


app.get('/', (req, res) => {
    res.send('Hello Dialogflow!')
})

app.post("/webhook", async (req, res) => {
    var id = (res.req.body.session).substr(43);
    console.log(id)
    const agent = new WebhookClient({ request: req, response: res });

    function welcome(agent) {
        console.log(`intent  =>  hi`);
        agent.add("Hi there, I am your AI Assistant, Could you please tell me your name?")
    }

    function details(agent) {
        const { person, phone, email, city, number, number1, date, course, gender } = agent.parameters;
        console.log(`intent  =>  details`);
        const accountSid = 'ACb798071e9e108a213986c9bb8695e6f1';
        const authToken = '9e811aab39ae2102f8cd74054aae76d9';
        const client = require('twilio')(accountSid, authToken);

        agent.add(`The Details Has Been Sent To Your Given Email.`)

        //     client.messages
        //    .create({
        //     body: 'testing',
        //     from: '+12072807860',
        //     to: '+9203362741319'
        //     })
        //     .then(message => console.log(message.sid))

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'rageelixir0987@gmail.com',
                pass: 'goptiegtuzzrysnb'
            }
        });

        var mailOptions = {
            from: 'rageelixir0987@gmail.com',
            to: email,
            subject: 'Student Details',
            html: `<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student ID Card</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f4f4f4;
            font-family: Arial, sans-serif;
        }
        .card {
            background: rgb(219, 219, 219);
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            width: 300px;
            padding: 20px;
            text-align: center;
        }
        .card img {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            margin-bottom: 15px;
        }
        .card h1 {
            margin: 0;
            font-size: 24px;
            color: #333;
        }
        .card h2 {
            margin: 10px 0 5px;
            font-size: 18px;
            color: #666;
        }
        .card h3 {
            margin: 0;
            font-size: 16px;
            color: #000;
        }
    </style>
</head>
<body>
    <div class="card">
    <center>
        <img src="https://media.licdn.com/dms/image/D4D0BAQGD8npW7pZRLQ/company-logo_200_200/0/1684398542686?e=2147483647&v=beta&t=cxKn8F_pSgzn_3jv215dGJiM0ATx-S2EjSnxtJYR3XY" alt="SMIT Logo">
        <h1>Student ID</h1>
        <h2>Name:</h2><h3>${person.name}</h3> 
        <h2>Gender:</h2> <h3>${gender}</h3>
        <h2>Number:</h2> <h3>+92${number}</h3> 
        <h2>CNIC:</h2> <h3>${number1}</h3> 
        <h2>Date Of Birth:</h2> <h3>${date}</h3> 
        <h2>City:</h2> <h3>${city}</h3> 
        <h2>Course:</h2> <h3>${course}</h3>
    </center>
    </div>
</body>
</html>`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }

    async function fallback() {
        let action = req.body.queryResult.action;
        let queryText = req.body.queryResult.queryText;

        if (action === 'input.unknown') {
            let result = await runChat(queryText);
            agent.add(result);
            console.log(result)
        } else {
            agent.add(result);
            console.log(result)
        }
    }

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('details', details);
    intentMap.set('Default Fallback Intent', fallback);
    agent.handleRequest(intentMap);
})

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});