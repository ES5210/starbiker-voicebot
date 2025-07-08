const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { handleSpeechToText } = require('./services/deepgram');
const { generateGPTResponse } = require('./services/openai');
const { generateSpeech } = require('./services/elevenlabs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/incoming', (req, res) => {
  res.type('text/xml');
  res.send(`
    <Response>
      <Say voice="alice" language="de-DE">Willkommen bei StarBiker. Wie kann ich Ihnen helfen?</Say>
      <Gather input="speech" action="/process" method="POST" timeout="8">
        <Say voice="alice" language="de-DE">Bitte sagen Sie mir, was Sie brauchen.</Say>
      </Gather>
    </Response>
  `);
});

app.post('/process', async (req, res) => {
  try {
    const userText = await handleSpeechToText(req);
    console.log("🗣️ Kunde sagt:", userText);

    const gptReply = await generateGPTResponse(userText);
    console.log("🤖 GPT antwortet:", gptReply);

    const audioUrl = await generateSpeech(gptReply);
    console.log("🔊 Antwort-Audio:", audioUrl);

    res.type('text/xml');
    res.send(`
      <Response>
        <Play>${audioUrl}</Play>
        <Gather input="speech" action="/process" method="POST" timeout="8">
          <Say voice="alice" language="de-DE">Haben Sie noch weitere Fragen?</Say>
        </Gather>
      </Response>
    `);
  } catch (err) {
    console.error("❌ Fehler:", err);
    res.type('text/xml');
    res.send(`
      <Response>
        <Say voice="alice" language="de-DE">Es gab einen Fehler. Bitte versuchen Sie es erneut.</Say>
      </Response>
    `);
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`✅ VoiceBot läuft auf Port ${port}`);
});
