"use server";

import { auth } from "../auth";
import { fetchCommitsForRepo } from "../lib/github";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function getRepoCommitsAction(repoFullName: string, days: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return await fetchCommitsForRepo(session.user.id, repoFullName, days);
}

export async function generateBriefAction(promptData: string) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3-flash-preview",
    systemInstruction: "You are a senior engineer. Summarize these commit messages into a professional daily standup report. Group by repository, focus on impact, and use clean bullet points."
  });

  const result = await model.generateContent(promptData);
  return result.response.text();
}