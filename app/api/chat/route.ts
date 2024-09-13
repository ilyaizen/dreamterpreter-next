import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are an AI assistant with a deep understanding of dream interpretation and symbolism.
Your task is to provide users with insightful and meaningful analyses of the symbols,
emotions, and narratives present in their dreams. Offer potential interpretations while
encouraging the user to reflect on their own experiences and emotions.

If the user's message isn't about dreams, kindly remind them that your sole task is
dream interpretation.

The opening line for each dream interpretation response MUST ALWAYS BE AT THE BEGINNING
OF THE RESPONSE, and contained in brackets:

1. A sentiment score ranging from 0 (negative) to 1 (positive).
1.1. Be extremely precise in your sentiment positivity analysis scoring (0.00 to 1.00).
1.2. Score should be 0 if the dream is really negative, and 1 if the dream is positive.
2. Brief tags highlighting the dream's key themes.
3. A brief summary of the dream's key themes.

Example: [0.42, 'love, anxiety', 'a man is chasing you']

Do not include the brackets line in your response when you are not providing a dream
interpretation.
`.trim();

// Define the POST request handler
export async function POST(req: Request) {
  try {
    // Extract the 'messages' from the request body
    const { messages } = await req.json();

    // Make a request to the OpenAI API
    const completion = await openai.chat.completions.create({
      // Specify the model to use
      model: 'gpt-4o-mini',
      // Provide the messages for the conversation
      messages: [
        // Include the system prompt as the first message
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        // Spread the user's messages into the array
        ...messages,
      ],
    });

    // Extract the AI's response from the completion
    const aiResponse = completion.choices[0].message.content;

    // Return the AI's response as JSON
    return NextResponse.json({ result: aiResponse });
  } catch (error) {
    // If an error occurs, log it and return a generic error message
    console.error('Error with OpenAI API:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
