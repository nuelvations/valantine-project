import OpenAI from "openai";
import { OPENAI_API_KEY } from "@/utils/env.utils";

let openAiClient: OpenAI | null = null;

export default function getClient() {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  if (!openAiClient) {
    openAiClient = new OpenAI({ baseURL: "https://openrouter.ai/api/v1", apiKey: OPENAI_API_KEY });

    return openAiClient;
  }

  return openAiClient;
}
