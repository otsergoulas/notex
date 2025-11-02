import OpenAI from 'openai';

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  return new OpenAI({ apiKey });
}

export async function analyzeText(text: string, userInstructions: string) {
  try {
    console.log("=== analyzeText called ===");
    console.log("Input text length:", text.length);
    console.log("User instructions:", userInstructions);

    const openai = getOpenAIClient();
    console.log("Making OpenAI API request...");

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that analyzes notes and whiteboards based on user instructions.'
        },
        {
          role: 'user',
          content: `${userInstructions}\n\nHere is the extracted text from notes/whiteboard:\n\n${text}`
        }
      ],
      temperature: 0.7,
    });

    console.log("=== OpenAI Response Received ===");
    console.log("Response from chatgpt:", response);
    console.log("Message content:", response.choices[0].message.content);

    const result = response.choices[0].message.content || '';
    console.log("Result:", result);
    return { response: result };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to analyze notes');
  }
}

