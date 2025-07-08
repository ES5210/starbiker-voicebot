async function handleSpeechToText(req) {
  const speechResult = req.body.SpeechResult;
  return speechResult || "Ich habe dich nicht verstanden.";
}
module.exports = { handleSpeechToText };
