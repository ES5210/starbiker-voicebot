const axios = require("axios");
const { createClient } = require("@deepgram/sdk");

// Deepgram-Client korrekt initialisieren
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// Twilio-Auth für Aufnahme
const twilioUsername = process.env.TWILIO_ACCOUNT_SID;
const twilioPassword = process.env.TWILIO_AUTH_TOKEN;

async function handleSpeechToText(recordingUrl) {
  try {
    const response = await axios.get(`${recordingUrl}.mp3`, {
      auth: {
        username: twilioUsername,
        password: twilioPassword,
      },
      responseType: "arraybuffer",
    });

    const { result } = await deepgram.listen.prerecorded.transcribeFile(
      response.data,
      {
        model: "general",
        smart_format: true,
        language: "de",
      }
    );

    return result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "Transkript leer";
  } catch (error) {
    console.error("🔴 Deepgram Fehler:", error.message);
    throw error;
  }
}

module.exports = { handleSpeechToText };
