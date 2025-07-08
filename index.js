const express = require("express");
const bodyParser = require("body-parser");
const { handleSpeechToText } = require("./services/deepgram");
const { generateGPTResponse } = require("./services/openai");
const { generateSpeech } = require("./services/elevenlabs");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Route 1: Startpunkt /incoming
app.post("/incoming", (req, res) => {
  res.type("text/xml");
  res.send(`
    <Response>
      <Say voice="Polly.Vicki" language="de-DE">
        Willkommen bei StarBiker. Wie kann ich Ihnen helfen?
      </Say>
      <Gather input="speech" action="/process" method="POST" timeout="5">
        <Say voice="Polly.Vicki" language="de-DE">
          Bitte sagen Sie jetzt Ihr Anliegen.
        </Say>
      </Gather>
    </Response>
  `);
});

// Route 2: Dialog fortsetzen /process
app.post("/process", async (req, res) => {
  try {
    const userSpeech = req.body?.SpeechResult;

if (!userSpeech || userSpeech.trim() === "") {
  console.log("❌ Kein SpeechResult empfangen – wiederhole die Frage.");

  return res.type('text/xml').send(`
    <Response>
      <Say>Ich habe dich leider nicht verstanden. Bitte sag es nochmal.</Say>
      <Gather input="speech" action="/process" method="POST" timeout="5">
        <Say>Was kann ich für dich tun?</Say>
      </Gather>
    </Response>
  `);
}
    console.log("🗣️ Kunde sagt:", userSpeech);

    const gptAnswer = await generateGPTResponse(userSpeech);
    console.log("🤖 GPT antwortet:", gptAnswer);

    const mp3Url = await generateSpeech(gptAnswer);
    console.log("🔊 Audio-URL:", mp3Url);

    res.type("text/xml");
    res.send(`
      <Response>
        <Play>${mp3Url}</Play>
        <Gather input="speech" action="/process" method="POST" timeout="6">
          <Say voice="Polly.Vicki" language="de-DE">
            Ich höre zu.
          </Say>
        </Gather>
      </Response>
    `);
  } catch (err) {
    console.error("❌ Fehler im Prozess:", err.message);
    res.type("text/xml");
    res.send(`
      <Response>
        <Say>Es gab ein Problem bei der Verarbeitung. Bitte versuchen Sie es später erneut.</Say>
      </Response>
    `);
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`✅ GPT-Voicebot läuft auf Port ${port}`);
});
