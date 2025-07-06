
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/webhook/answer', (req, res) => {
  const ncco = [
    {
      action: 'talk',
      voiceName: 'Amy',
      text: 'Hallo! Willkommen bei Star-Biker. Wie kann ich Ihnen helfen?'
    }
  ];
  res.json(ncco);
});

app.get('/', (req, res) => {
  res.send('Star-Biker Voicebot ist online!');
});

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
