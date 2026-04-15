import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await client.responses.create({
      model: "gpt-5.4",
      input: [
        {
          role: "system",
          content:
            "Ты теплый, мягкий, спокойный русскоязычный помощник психологической поддержки. Ты не ставишь диагнозы, не осуждаешь, говоришь бережно и помогаешь человеку разложить состояние по шагам.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    return NextResponse.json({
      reply: response.output_text,
    });
 } catch (error: any) {
  console.error(error);
  return NextResponse.json(
    { error: error?.message || "AI request failed" },
    { status: 500 }
  );
}
}
