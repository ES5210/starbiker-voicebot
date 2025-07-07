const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(bodyParser.json());

// ➕ Chat-Verlauf zwischenspeichern (einfach im Arbeitsspeicher)
let conversationHistory = [
  {
    role: 'system',
    content: 'Du bist ein professioneller Telefonberater für Star-Biker (www.star-biker.com) – ein Shop für Elektromobilität. Du kennst die Modelle Chopper M1P Custom, Chopper 6.0s Basic/Premium, Shelwy Italian, Chopper M1PS Knight, alle technischen Daten, Farben, Preise, Führerscheinregeln, Lieferzeiten (1–3 Tage), sowie Rückgabe, Service und Abholung. Du antwortest ausführlich, höflich und auf Deutsch.'
  }
];

// 📞 Start des Anrufs
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

// 🧠 Sprachverarbeitung + GPT + Rückfrage
app.post('/webhook/asr', async (req, res) => {
  const userInput = req.body.speech?.results?.[0]?.text;

  if (!userInput) {
    return res.json([
      {
        action: 'talk',
        voiceName: 'Vicki',
        text: 'Entschuldigung, ich habe Sie nicht verstanden. Können Sie das bitte wiederholen?'
      },
      {
        action: 'input',
        eventUrl: ['https://star-biker-voicebot.onrender.com/webhook/asr'],
        type: ['speech'],
        speech: { language: 'de-DE', endOnSilence: 1 }
      }
    ]);
  }

  // ⏺ Verlauf fortsetzen
  conversationHistory.push({ role: 'user', content: userInput });

  let gptReply = 'Entschuldigung, gerade gab es ein Problem mit dem Kundenservice.';

  try {
    const gptRes = await axios.post(
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

    gptReply = gptRes.data.choices[0].message.content;
    conversationHistory.push({ role: 'assistant', content: gptReply });
  } catch (error) {
    console.error('GPT Fehler:', error.message);
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
      speech: { language: 'de-DE', endOnSilence: 1 }
    }
  ]);
});

app.listen(port, () => {
  console.log(`StarBiker GPT Voicebot läuft auf Port ${port}`);
});
