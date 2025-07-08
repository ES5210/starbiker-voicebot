const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateGPTResponse(userText) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "Du bist ein professioneller Motorrad-Serviceberater bei StarBiker. Antworte kurz, freundlich und auf Deutsch." },
      { role: "user", content: userText },
    ],
    model: "gpt-4",
  });

  return chatCompletion.choices[0].message.content;
}

module.exports = { generateGPTResponse };
