
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());

app.all('/webhook/answer', (req, res) => {
  const ncco = [
    {
      action: 'talk',
      voiceName: 'Vicki',
      text: 'Willkommen bei Star-Biker. Wie kann ich Ihnen helfen?'
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
  ];
  res.json(ncco);
});

app.post('/webhook/asr', async (req, res) => {
  console.log('📥 Spracheingabe:', JSON.stringify(req.body, null, 2));

  const userInput = req.body?.speech?.results?.[0]?.text;
  if (!userInput) {
    return res.json([
      {
        action: 'talk',
        voiceName: 'Vicki',
        text: 'Entschuldigung, ich habe Sie leider nicht verstanden. Können Sie das bitte wiederholen?'
      },
      {
        action: 'input',
        eventUrl: [`${req.protocol}://${req.get('host')}/webhook/asr`],
        type: ['speech'],
        speech: { language: 'de-DE', endOnSilence: 2 }
      }
    ]);
  }

  const prompt = [
    {
      role: 'system',
      content: 'Du bist ein professioneller Kundenberater für Star-Biker (www.star-biker.com), einem Shop für E‑Chopper und Elektroroller. Du kennst Modelle wie Chopper M1P Custom, Chopper 6.0s, Shelwy Italian und Knight Edition, inklusive Preise, Farben, Technik, Lieferzeit (1–3 Tage), Führerscheinregeln (AM, B, B196), Abholung im Store und Service. Antworte freundlich, ehrlich und auf Deutsch.'
    },
    {
      role: 'user',
      content: userInput
    }
  ];

  let gptReply = 'Entschuldigung, es gab ein Problem mit dem Kundenservice.';

  try {
    const gptRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: prompt,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    gptReply = gptRes.data.choices[0].message.content;
  } catch (err) {
    console.error('GPT-Fehler:', err.response?.data || err.message);
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
