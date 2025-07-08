const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel

async function generateSpeech(text) {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  // 1. ElevenLabs Text-to-Speech anfordern
  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      text,
      voice_settings: {
        stability: 0.4,
        similarity_boost: 0.8,
      }
    },
    {
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    }
  );

  // 2. Temporär speichern
  const fileName = `voice_${Date.now()}.mp3`;
  const filePath = path.join('/tmp', fileName);
  fs.writeFileSync(filePath, response.data);

  // 3. In Cloudinary hochladen
  const uploadResult = await cloudinary.uploader.upload(filePath, {
    resource_type: "video", // wichtig für MP3!
    folder: "voicebot",
    public_id: fileName.replace('.mp3', ''),
    format: "mp3",
  });

  // 4. URL zurückgeben
  return uploadResult.secure_url;
}

module.exports = { generateSpeech };
