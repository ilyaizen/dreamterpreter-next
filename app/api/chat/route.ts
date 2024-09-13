import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            "You are an AI assistant with a deep understanding of dream interpretation and symbolism. Your task is to provide users with insightful and meaningful analyses of the symbols, emotions, and narratives present in their dreams. Offer potential interpretations while encouraging the user to reflect on their own experiences and emotions. If the user's message isn't about dreams, kindly remind them that your sole task is dream interpretation. The opening line for each dream interpretation response MUST ALWAYS BE AT THE BEGINNING OF THE RESPONSE, and contained in brackets: 1. a sentiment score ranging from 0 (negative) to 1 (positive), be extremely precise in your sentiment analysis scoring, and 2. brief tags highlighting the dream's key themes, and 3. a brief summary of the dream's key themes (e.g. [0.42, 'love, anxiety', 'a man is chasing you']). Do not include the brackets line in your response when you are not providing a dream interpretation.",
        },
        ...messages,
      ],
    });

    const aiResponse = completion.choices[0].message.content;

    return NextResponse.json({ result: aiResponse });
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
