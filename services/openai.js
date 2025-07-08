const { Configuration, OpenAIApi } = require("openai");
const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(config);

async function generateGPTResponse(userInput) {
  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{ role: "user", content: userInput }],
  });
  return completion.data.choices[0].message.content;
}

module.exports = { generateGPTResponse };
