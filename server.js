const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const bodyParser = require("body-parser");
const pino = require("pino");

const app = express();

const logger = pino({
	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
		},
	},
});

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
	res.sendStatus(200);
});

app.post("/chat", async (req, res) => {
	let {
		messages,
		message,
		functions,
		function_call,
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
		logger.warn("Messages is required");
		return res.status(400).send("Messages is required");
	}
	if (typeof messages === "string") {
		messages = [{ role: "user", content: messages }];
	}

	try {
		const openai = new OpenAI(api_key || process.env.OPENAI_API_KEY);

		const completion = await openai.chat.completions.create({
			model: model || "gpt-3.5-turbo",
			messages: messages,
			functions: functions,
			function_call: function_call,
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

		const chatResponse = completion.choices[0]?.message;
		logger.info({ message: chatResponse });
		return res.status(200).send({ message: chatResponse });
	} catch (error) {
		logger.error(error);
		return res.status(500).send("An error occurred:\n\n" + error);
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	logger.info(`Server is running on port ${PORT}`);
});
