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
      <Say voice="alice" language="de-DE">
        Willkommen beim StarBiker VoiceBot. Wie kann ich Ihnen helfen?
      </Say>
      <Gather input="speech" action="/process" method="POST" timeout="5">
        <Say>Sagen Sie mir bitte, was Sie benötigen.</Say>
      </Gather>
    </Response>
  `);
});

app.post('/process', async (req, res) => {
  console.log("📞 Neue Eingabe erkannt");

  try {
    const transcription = await handleSpeechToText(); // Simuliert Spracheingabe
    console.log("🗣️ Kunde sagt:", transcription);

    const gptResponse = await generateGPTResponse(transcription);
    console.log("🤖 GPT antwortet:", gptResponse);

    const audioUrl = await generateSpeech(gptResponse);
    console.log("🔊 Audio-URL:", audioUrl);

    res.type('text/xml');
    res.send(`
      <Response>
        <Play>${audioUrl}</Play>
        <Gather input="speech" action="/process" method="POST" timeout="5">
          <Say>Haben Sie noch weitere Fragen?</Say>
        </Gather>
      </Response>
    `);
  } catch (err) {
    console.error("Fehler:", err);
    res.type('text/xml');
    res.send(`
      <Response>
        <Say>Entschuldigung, es gab einen Fehler bei der Verarbeitung.</Say>
      </Response>
    `);
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`✅ Dialog-VoiceBot läuft auf Port ${port}`);
});
