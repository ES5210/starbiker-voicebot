const express = require('express');
require('dotenv').config();
const { handleSpeechToText } = require('./services/deepgram');
const { getGPTResponse } = require('./services/openai');
const { generateSpeech } = require('./services/elevenlabs');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post('/incoming', async (req, res) => {
  console.log('📞 Anruf empfangen');

  const simulatedTranscript = "Ich brauche einen Termin für meine Ducati";
  const gptReply = await getGPTResponse(simulatedTranscript);
  const audioUrl = await generateSpeech(gptReply);

  const twiml = `
    <Response>
      <Play>${audioUrl}</Play>
    </Response>
  `;

  res.type('text/xml');
  res.send(twiml);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ GPT-Voicebot läuft auf Port ${port}`);
});
