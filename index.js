const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(bodyParser.json());

// Einfacher Verlauf im RAM – für Demo-Zwecke
let conversationHistory = [
  {
    role: 'system',
    content: `Du bist ein professioneller Telefonberater für Star-Biker (www.star-biker.com) – ein Shop für Elektromobilität. Du kennst die Modelle Chopper M1P Custom, Chopper 6.0s Basic/Premium, Shelwy Italian, Chopper M1PS Knight, technische Daten, Farben, Preise, Führerscheinregeln, Lieferzeiten (1–3 Tage), Rückgabe, Service und Abholung. Du berätst freundlich, verständlich und professionell auf Deutsch.`
  }
];

// Begrüßung beim Anruf
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

// GPT-Sprachverarbeitung
app.post('/webhook/asr', async (req, res) => {
  const userInput = req.body.speech?.results?.[0]?.text;

  // Wenn Spracheingabe fehlt
  if (!userInput) {
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
        speech: {
          language: 'de-DE',
          endOnSilence: 1
        }
      }
    ]);
  }

  // Eingabe speichern
  conversationHistory.push({ role: 'user', content: userInput });

  let gptReply = 'Entschuldigung, es gab ein Problem mit dem Kundenservice.';

  try {
    const gptRes = await axios.post(
      'https://api.openai.com/v1/chat/completions', // ✅ korrekte URL
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

  // Antwort + Nachfrage + erneute Spracheingabe
  res.json([
    {
      action: 'talk',
      voiceName: 'Vicki',
      text: gptReply
    },
    {
      action: 'talk',
      voiceName: 'Vicki',
      text: 'Möchten Sie noch etwas wissen?'
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

// Start
app.listen(port, () => {
  console.log(`✅ StarBiker GPT Voicebot läuft auf Port ${port}`);
});
