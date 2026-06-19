import { GoogleGenerativeAI } from "@google/generative-ai";

export const configureGemini = () => {
	const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
	const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
	return model;
};