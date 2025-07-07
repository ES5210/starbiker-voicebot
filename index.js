const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Logging aktivieren
app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Einfache Verlaufsspeicherung im RAM
let conversationHistory = [
  {
    role: 'system',
    content: `Du bist ein professioneller Kundenberater für Star-Biker (www.star-biker.com), einem Shop für E‑Chopper und Elektroroller. Du kennst Modelle wie Chopper M1P Custom, Chopper 6.0s, Shelwy Italian und Knight Edition, inklusive Preise, Farben, Technik, Lieferzeit (1–3 Tage), Führerscheinregeln (AM, B, B196), Abholung im Store und Service. Antworte freundlich, ehrlich und auf Deutsch.`
  }
];

// Begrüßung bei eingehendem Anruf
app.get('/webhook/answer', (req, res) => {
  const ncco = [
    {
      action: 'talk',
      voiceName: 'Vicki',
      text: 'Willkommen bei Star-Biker. Wie kann ich Ihnen helfen?'
    },
    {
      action: 'input',
      eventUrl: ['https://star-biker-voicebot.onrender.com/webhook/asr'],
      type: ['speech'],
      speech: {
        language: 'de-DE',
        endOnSilence: 1
      }
    }
  ];
  res.json(ncco);
});

// Sprachverarbeitung mit GPT
app.post('/webhook/asr', async (req, res) => {
  console.log('📥 Eingehende Spracheingabe:');
  console.log(JSON.stringify(req.body, null, 2));

  let userInput = '';
  try {
    if (req.body?.speech?.results?.length > 0) {
      userInput = req.body.speech.results[0].text;
    }
  } catch (err) {
    console.error('❌ Fehler beim Extrahieren von Spracheingabe:', err.message);
  }

  if (!userInput) {
    console.warn('⚠️ Keine Sprache erkannt. Sende Wiederholung.');
    return res.json([
      {
        action: 'talk',
        voiceName: 'Vicki',
        text: 'Ich habe Sie leider nicht verstanden. Können Sie das bitte wiederholen?'
      },
      {
        action: 'input',
        eventUrl: ['https://star-biker-voicebot.onrender.com/webhook/asr'],
        type: ['speech'],
        speech: { language: 'de-DE', endOnSilence: 1 }
      }
    ]);
  }

  // Verlauf fortsetzen
  conversationHistory.push({ role: 'user', content: userInput });

  let gptReply = 'Entschuldigung, ich konnte Ihre Frage gerade nicht beantworten.';

  try {
    const gptResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: conversationHistory,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    gptReply = gptResponse.data.choices[0].message.content;
    conversationHistory.push({ role: 'assistant', content: gptReply });

    console.log('🧠 GPT-Antwort:', gptReply);
  } catch (error) {
    console.error('❌ GPT-Fehler:', error.response?.data || error.message);
  }

  res.json([
    {
      action: 'talk',
      voiceName: 'Vicki',
      text: gptReply
    },
    {
      action: 'talk',
      voiceName: 'Vicki',
      text: 'Kann ich sonst noch etwas für Sie tun?'
    },
    {
      action: 'input',
      eventUrl: ['https://star-biker-voicebot.onrender.com/webhook/asr'],
      type: ['speech'],
      speech: {
        language: 'de-DE',
        endOnSilence: 1
      }
    }
  ]);
});

app.listen(port, () => {
  console.log(`✅ StarBiker Voicebot läuft auf Port ${port}`);
});
