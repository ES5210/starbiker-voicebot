require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { handleSpeechToText } = require("./services/deepgram");
const { generateGPTResponse } = require("./services/openai");
const { generateSpeech } = require("./services/elevenlabs");


const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 📞 Route 1: Start – nimmt auf und leitet weiter
app.post("/incoming", (req, res) => {
  res.type("text/xml");
  res.send(`
    <Response>
      <Say voice="Polly.Vicki" language="de-DE">
        Willkommen bei StarBiker. Bitte sprechen Sie nach dem Signalton.
      </Say>
      <Record action="/process" method="POST" maxLength="15" playBeep="true" />
    </Response>
  `);
});

// 🔁 Route 2: verarbeitet Aufnahme + Antwort
app.post("/process", async (req, res) => {
  try {
    const recordingUrl = req.body.RecordingUrl;
    if (!recordingUrl) throw new Error("Keine Aufnahme erhalten");

    console.log("📥 Aufnahme-URL:", recordingUrl);

    const userText = await handleSpeechToText(recordingUrl);
    console.log("🗣️ Kunde sagt:", userText);

    const gptAnswer = await generateGPTResponse(userText);
    console.log("🤖 GPT antwortet:", gptAnswer);

    const mp3Url = await generateSpeech(gptAnswer);
    console.log("🔊 MP3-URL:", mp3Url);

    res.type("text/xml");
    res.send(`
      <Response>
        <Play>${mp3Url}</Play>
        <Redirect>/incoming</Redirect>
      </Response>
    `);
  } catch (err) {
    console.error("❌ Fehler:", err.message);
    res.type("text/xml");
    res.send(`
      <Response>
        <Say>Es gab ein Problem. Bitte versuchen Sie es später erneut.</Say>
      </Response>
    `);
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`✅ GPT-Voicebot läuft auf Port ${port}`);
});
