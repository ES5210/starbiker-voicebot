const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Twilio Webhook
app.post('/incoming', (req, res) => {
  console.log('✅ Incoming call webhook triggered');

  res.type('text/xml');
  res.send(`
    <Response>
      <Say voice="alice" language="de-DE">Hallo! Dein StarBiker VoiceBot ist jetzt aktiv.</Say>
    </Response>
  `);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Voicebot läuft auf Port ${port}`);
});
