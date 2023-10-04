const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const bodyParser = require("body-parser");
const pino = require('pino');
const pinoPretty = require('pino-pretty');

const app = express();

const logger = pino({
level: 'info'
});

logger.pipe(pinoPretty());

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
	res.sendStatus(200);
});

app.post("/chat", async (req, res) => {
	let {
		messages,
		message,
		model,
		max_tokens,
		n,
		stop,
		temperature,
		top_p,
		frequency_penalty,
		presence_penalty,
		logprobs,
		echo,
		api_key,
	} = req.body;

	messages = messages || message;

	if (!messages) {
		return res.status(400).send("Messages is required");
	}
	if (typeof messages === "string") {
		messages = [{ role: "user", content: messages }];
	}

	try {
		const openai = new OpenAI(api_key || process.env.OPENAI_API_KEY);

		const completion = await openai.chat.completions.create({
			messages: messages,
			model: model || "gpt-3.5-turbo",
			max_tokens: max_tokens,
			n: n,
			stop: stop,
			temperature: temperature,
			top_p: top_p,
			frequency_penalty: frequency_penalty,
			presence_penalty: presence_penalty,
			logprobs: logprobs,
			echo: echo,
		});

		const chatResponse = completion.choices[0]?.message.content.trim();
		logger.info({ message: chatResponse });
		return res.status(200).send({ message: chatResponse });
	} catch (error) {
		logger.error(error);
		return res.status(500).send("An error occurred:\n\n" + error);
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
