const express = require('express');
const app = express();
app.use(express.json());

// Test-Webhook für Twilio
app.post('/incoming', (req, res) => {
  console.log('✅ Incoming call webhook triggered');
  res.set('Content-Type', 'text/xml');
  res.send(`<Response><Say voice="Polly.Marlene">Hallo! Dein StarBiker VoiceBot ist verbunden.</Say></Response>`);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Voicebot läuft auf Port ${port}`);
});
