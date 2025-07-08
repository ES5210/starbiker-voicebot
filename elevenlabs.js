const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function generateSpeech(text) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = '21m00Tcm4TlvDq8ikWAM';
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const response = await axios.post(url, {
    text: text,
    model_id: "eleven_monolingual_v1",
    voice_settings: { stability: 0.5, similarity_boost: 0.5 }
  }, {
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    responseType: 'arraybuffer'
  });

  const outputPath = path.join(__dirname, '..', 'output.mp3');
  fs.writeFileSync(outputPath, response.data);

  return "https://demo-files.s3.amazonaws.com/output.mp3";
}

module.exports = { generateSpeech };
