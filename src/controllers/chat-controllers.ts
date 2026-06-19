import { Request, Response, NextFunction } from "express";
import User from "../models/user-model.js";
import { configureGemini } from "../configs/gemini-config.js";

export const generateChatCompletion = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { message } = req.body;

		const user = await User.findById(res.locals.jwtData.id);
		if (!user) {
			return res.status(401).json("User not registered / token malfunctioned");
		}

		// existing chats, converted to Gemini's expected history format
		const geminiHistory = user.chats.map((chat) => ({
			role: chat.role === "assistant" ? "model" : "user",
			parts: [{ text: chat.content }],
		}));

		// save the user's new message to our own chat history
		user.chats.push({ content: message, role: "user" });

		const model = configureGemini();
		const chat = model.startChat({ history: geminiHistory });
		const result = await chat.sendMessage(message);
		const responseText = result.response.text();

		// save Gemini's response, keeping role naming consistent with the rest of the app
		user.chats.push({ content: responseText, role: "assistant" });

		await user.save();

		return res.status(200).json({ chats: user.chats });
	} catch (error: any) {
		console.log(error);
		return res.status(500).json({ message: error.message });
	}
};

export const getAllChats = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = await User.findById(res.locals.jwtData.id);

		if (!user)
			return res.status(401).json({
				message: "ERROR",
				cause: "User doesn't exist or token malfunctioned",
			});

		if (user._id.toString() !== res.locals.jwtData.id) {
			return res
				.status(401)
				.json({ message: "ERROR", cause: "Permissions didn't match" });
		}
		return res.status(200).json({ message: "OK", chats: user.chats });
	} catch (err: any) {
		console.log(err);
		return res.status(200).json({ message: "ERROR", cause: err.message });
	}
};

export const deleteAllChats = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = await User.findById(res.locals.jwtData.id);

		if (!user)
			return res.status(401).json({
				message: "ERROR",
				cause: "User doesn't exist or token malfunctioned",
			});

		if (user._id.toString() !== res.locals.jwtData.id) {
			return res
				.status(401)
				.json({ message: "ERROR", cause: "Permissions didn't match" });
		}

		//@ts-ignore
		user.chats = [];
		await user.save();
		return res.status(200).json({ message: "OK", chats: user.chats });
	} catch (err: any) {
		console.log(err);
		return res.status(200).json({ message: "ERROR", cause: err.message });
	}
};