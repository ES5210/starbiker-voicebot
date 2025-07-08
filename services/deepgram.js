const axios = require("axios");
const { createClient } = require("@deepgram/sdk");

// NEU: Deepgram v3 Initialisierung
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// Twilio-Zugangsdaten aus .env
const twilioUsername = process.env.TWILIO_ACCOUNT_SID;
const twilioPassword = process.env.TWILIO_AUTH_TOKEN;

async function handleSpeechToText(recordingUrl) {
  try {
    // 📥 1. Authentifizierter Download der MP3-Datei von Twilio
    const audioResponse = await axios.get(`${recordingUrl}.mp3`, {
      auth: {
        username: twilioUsername,
        password: twilioPassword,
      },
      responseType: "arraybuffer",
    });

    // 🧠 2. Transkription durch Deepgram
    const { result } = await deepgram.listen.prerecorded.transcribeFile(audioResponse.data, {
      model: "general",
      language: "de",
      smart_format: true,
      punctuate: true,
    });

    const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript;

    if (!transcript) throw new Error("Keine Transkription erhalten");
    return transcript;
  } catch (error) {
    console.error("🔴 Deepgram Fehler:", error.message);
    throw error;
  }
}

module.exports = { handleSpeechToText };
