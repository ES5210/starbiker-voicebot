const axios = require("axios");
const { createClient } = require("@deepgram/sdk");

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

const twilioUsername = process.env.TWILIO_ACCOUNT_SID;
const twilioPassword = process.env.TWILIO_AUTH_TOKEN;

async function handleSpeechToText(recordingUrl) {
  try {
    const audio = await axios.get(`${recordingUrl}.mp3`, {
      auth: {
        username: twilioUsername,
        password: twilioPassword,
      },
      responseType: "arraybuffer",
    });

    const result = await deepgram.transcription.preRecorded(
      {
        buffer: audio.data,
        mimetype: "audio/mpeg",
      },
      {
        model: "nova",
        language: "de",
        smart_format: true,
        punctuate: true,
      }
    );

    return result.results.channels[0].alternatives[0].transcript;
  } catch (err) {
    console.error("🔴 Deepgram Fehler:", err.message);
    throw err;
  }
}

module.exports = { handleSpeechToText };
