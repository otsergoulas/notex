import OpenAI from 'openai';

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  return new OpenAI({ apiKey });
}

export async function classifyAndSummarize(text: string, userInstructions: string) {
  try {
    console.log("=== classifyAndSummarize called ===");
    console.log("Input text length:", text.length);
    console.log("User instructions:", userInstructions);

    const openai = getOpenAIClient();
    console.log("Making OpenAI API request...");

    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'user',
          content: `${userInstructions}\n\nHere is the extracted text from notes/whiteboard:\n\n${text}\n\nPlease respond in JSON format.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 1,
    });

    console.log("=== OpenAI Response Received ===");
    console.log("Response from chatgpt:", response);
    console.log("Message content:", response.choices[0].message.content);

    const result = JSON.parse(response.choices[0].message.content || '{}');
    console.log("Parsed result:", result);
    return result;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to classify and summarize notes');
  }
}

