const axios = require('axios');

async function getGPTResponse(userText) {
  const apiKey = process.env.OPENAI_API_KEY;

  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4',
    messages: [
      { role: 'system', content: "Du bist ein freundlicher Motorrad-Serviceberater bei StarBiker." },
      { role: 'user', content: userText }
    ]
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data.choices[0].message.content;
}

module.exports = { getGPTResponse };
