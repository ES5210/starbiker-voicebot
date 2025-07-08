const axios = require("axios");
const { Deepgram } = require("@deepgram/sdk");

const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);

// NEU: Twilio Credentials aus der .env Datei
const twilioUsername = process.env.TWILIO_ACCOUNT_SID;
const twilioPassword = process.env.TWILIO_AUTH_TOKEN;

async function handleSpeechToText(recordingUrl) {
  try {
    // Authentifizierter Abruf der Twilio-Aufnahme
    const audioResponse = await axios.get(`${recordingUrl}.mp3`, {
      auth: {
        username: twilioUsername,
        password: twilioPassword,
      },
      responseType: "arraybuffer",
    });

    // Analyse durch Deepgram
    const transcription = await deepgram.transcription.preRecorded(
      { buffer: audioResponse.data, mimetype: "audio/mpeg" },
      { punctuate: true, language: "de" }
    );

    return transcription.results.channels[0].alternatives[0].transcript;
  } catch (error) {
    console.error("🔴 Deepgram Fehler:", error.message);
    throw error;
  }
}

module.exports = { handleSpeechToText };
