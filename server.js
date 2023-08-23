const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const bodyParser = require("body-parser");

const app = express();
const openai = new OpenAI(process.env.OPENAI_API_KEY);

app.use(cors());
app.use(bodyParser.json());

app.post("/chat", async (req, res) => {
	const { message, model, maxTokens, n, stop, temperature, topP, frequencyPenalty, presencePenalty, logprobs, echo } =
		req.body;

	if (!message) {
		return res.status(400).send("Message is required");
	}

	try {
		const completion = await openai.chat.completions.create({
			messages: [{ role: "user", content: message }],
			model: model || "gpt-3.5-turbo",
			max_tokens: maxTokens,
			n: n,
			stop: stop,
			temperature: temperature,
			top_p: topP,
			frequency_penalty: frequencyPenalty,
			presence_penalty: presencePenalty,
			logprobs: logprobs,
			echo: echo,
		});

		const chatResponse = completion.choices[0]?.text.trim();
		return res.status(200).send({ message: chatResponse });
	} catch (error) {
		console.error(error);
		return res.status(500).send("An error occurred:\n\n" + error);
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
