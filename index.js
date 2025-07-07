const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Middleware
app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Basiswissen für GPT
let conversationHistory = [
  {
    role: 'system',
    content: `
Du bist ein professioneller, freundlicher Kundenberater für Star-Biker (https://www.star-biker.com).
Du kennst E-Roller und Chopper wie:
- M1P Custom
- Chopper 6.0s
- Knight Edition
- Shelwy Italian

Antworten:
- in klarem, natürlichem Deutsch
- kompakt, ehrlich, hilfreich
- Preis, Führerschein (AM, B, B196), Lieferzeit (1–3 Tage), Service und Abholung im Store

Vermeide Fantasieantworten. Wenn du etwas nicht weißt, sag ehrlich "Dazu habe ich leider keine Informationen".
    `.trim()
  }
];

// Einstieg: Begrüßung + Sprache aktivieren
app.get('/webhook/answer', (req, res) => {
  const ncco = [
    {
      action: 'talk',
      voiceName: 'Marlene',
      text: 'Willkommen bei Star-Biker. Was möchten Sie wissen?'
    },
    {
      action: 'input',
      eventUrl: [`${req.protocol}://${req.get('host')}/webhook/asr`],
      type: ['speech'],
      speech: {
        language: 'de-DE',
        endOnSilence: 2 // mehr Zeit zum Sprechen
      }
    }
  ];
  res.json(ncco);
});

// GPT-Sprachverarbeitung
app.post('/webhook/asr', async (req, res) => {
  console.log('📥 Spracheingabe erhalten:');
  console.log(JSON.stringify(req.body, null, 2));

  const userInput = req.body?.speech?.results?.[0]?.text || '';

  if (!userInput) {
    console.warn('⚠️ Keine Sprache erkannt.');
    return res.json([
      {
        action: 'talk',
        voiceName: 'Marlene',
        text: 'Entschuldigung, ich habe Sie nicht verstanden. Bitte wiederholen Sie Ihre Frage.'
      },
      {
        action: 'input',
        eventUrl: [`${req.protocol}://${req.get('host')}/webhook/asr`],
        type: ['speech'],
        speech: {
          language: 'de-DE',
          endOnSilence: 2
        }
      }
    ]);
  }

  // Verlauf speichern
  conversationHistory.push({ role: 'user', content: userInput });

  let replyText = 'Es gab leider ein Problem bei der Antwort.';

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: conversationHistory,
        temperature: 0.6
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    replyText = response.data.choices[0].message.content.trim();
    conversationHistory.push({ role: 'assistant', content: replyText });

    console.log('🧠 GPT Antwort:', replyText);
  } catch (err) {
    console.error('❌ GPT Fehler:', err.response?.data || err.message);
  }

  res.json([
    {
      action: 'talk',
      voiceName: 'Marlene',
      text: replyText
    },
    {
      action: 'talk',
      voiceName: 'Marlene',
      text: 'Kann ich noch bei etwas anderem helfen?'
    },
    {
      action: 'input',
      eventUrl: [`${req.protocol}://${req.get('host')}/webhook/asr`],
      type: ['speech'],
      speech: {
        language: 'de-DE',
        endOnSilence: 2
      }
    }
  ]);
});

app.listen(port, () => {
  console.log(`✅ StarBiker Voicebot läuft auf Port ${port}`);
});
