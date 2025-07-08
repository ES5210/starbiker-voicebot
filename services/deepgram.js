const axios = require("axios");

async function handleSpeechToText(recordingUrl) {
  const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

  const response = await axios({
    method: "POST",
    url: "https://api.deepgram.com/v1/listen",
    headers: {
      Authorization: `Token ${deepgramApiKey}`,
      "Content-Type": "application/json"
    },
    data: {
      url: `${recordingUrl}.mp3`, // Twilio gibt nur Base-URL zurück!
      language: "de",
      model: "nova",
      smart_format: true
    }
  });

  const transcript = response.data.results.channels[0].alternatives[0].transcript;
  return transcript || "Keine Sprache erkannt";
}

module.exports = { handleSpeechToText };
