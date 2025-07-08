const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Standardstimme "Rachel"

async function generateSpeech(text) {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      text,
      voice_settings: {
        stability: 0.4,
        similarity_boost: 0.8
      }
    },
    {
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json"
      },
      responseType: "arraybuffer"
    }
  );

  // Temporäre Datei speichern
  const fileName = `audio_${Date.now()}.mp3`;
  const filePath = path.join('/tmp', fileName);
  fs.writeFileSync(filePath, response.data);

  // Render erlaubt statische Datei-URLs nur über externe Hoster
  // Für den Test kannst du temporär eine statische MP3 verwenden:
  return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  // Für echten Upload → externes Hosting (z. B. S3, Cloudinary, BunnyCDN)
}

module.exports = { generateSpeech };
