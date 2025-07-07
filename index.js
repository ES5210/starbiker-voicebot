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
        speech: {
          language: 'de-DE',
          endOnSilence: 1
        }
      }
    ]);
  }

  // Verlauf speichern
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

  // 💬 GPT antwortet + Nachfrage + wartet auf neue Spracheingabe
  const ncco = [
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
  ];

  res.json(ncco);
});
