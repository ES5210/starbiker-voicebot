
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(bodyParser.json());

// Step 1: Initial greeting + ASR (speech recognition)
app.get('/webhook/answer', (req, res) => {
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
        endOnSilence: 1
      }
    }
  ];
  res.json(ncco);
});

// Step 2: ASR callback → send to ChatGPT → respond with TTS
app.post('/webhook/asr', async (req, res) => {
  const userText = req.body.speech?.results?.[0]?.text || 'Ich habe das nicht verstanden.';

  let gptAnswer = 'Entschuldigung, ich konnte Ihre Anfrage nicht verstehen.';

  try {
    const openaiRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'Du bist ein professioneller Kundenservice-Bot für einen Elektromobilitäts-Shop namens Star-Biker. Beantworte Fragen höflich, präzise und auf Deutsch.' },
          { role: 'user', content: userText }
        ],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    gptAnswer = openaiRes.data.choices[0].message.content;
  } catch (err) {
    console.error('GPT-Fehler:', err.message);
  }

  const ncco = [
    {
      action: 'talk',
      voiceName: 'Vicki',
      text: gptAnswer
    }
  ];
  res.json(ncco);
});

app.listen(port, () => {
  console.log(`StarBiker GPT Voicebot läuft auf Port ${port}`);
});
