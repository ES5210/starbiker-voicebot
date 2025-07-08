const express = require('express');
const { handleSpeechToText } = require('./services/deepgram');
const { getGPTResponse } = require('./services/openai');
const { generateSpeech } = require('./services/elevenlabs');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post('/incoming', async (req, res) => {
  console.log("📞 Anruf eingegangen");

  // 1. Simuliere Spracheingabe
  const userText = await handleSpeechToText(); // später: Audiodaten analysieren
  console.log("🗣️ Kunde sagt:", userText);

  // 2. GPT-Antwort generieren
  const botReply = await getGPTResponse(userText);
  console.log("🤖 GPT antwortet:", botReply);

  // 3. Sprach-Audio erstellen (MP3-URL)
  const audioUrl = await generateSpeech(botReply);
  console.log("🔊 MP3-URL:", audioUrl);

  // 4. Antworte mit TwiML
  res.type('text/xml');
  res.send(`
    <Response>
      <Play>${audioUrl}</Play>
    </Response>
  `);
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`✅ GPT-Voicebot läuft auf Port ${port}`);
});
