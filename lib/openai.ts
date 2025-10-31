import OpenAI from 'openai';

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  return new OpenAI({ apiKey });
}

export async function classifyAndSummarize(text: string, customInstructions?: string) {
  try {
    console.log("=== classifyAndSummarize called ===");
    console.log("Input text length:", text.length);
    console.log("Custom instructions:", customInstructions || "(none)");

    const openai = getOpenAIClient();
    console.log("Making OpenAI API request...");

    const systemPrompt = `You are an AI assistant that helps organize and analyze notes. Your task is to:
1. Identify distinct notes or sections in the text
2. Classify each note by topic/category
3. Create a detailed, meaningful summary that connects the dots between different pieces of information
4. Generate actionable insights and next steps when relevant

${customInstructions ? `\n**USER'S SPECIFIC INSTRUCTIONS:**\n${customInstructions}\n\nPlease follow these instructions while organizing the notes.` : ''}

Respond in JSON format:
{
  "notes": [
    {"content": "note text", "category": "category name", "position": 0}
  ],
  "summary": "A detailed, comprehensive summary that connects ideas and provides context",
  "actionSteps": ["List of concrete action items or next steps derived from the notes"],
  "keyInsights": ["Important insights or connections found in the text"],
  "categories": ["category1", "category2"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Please analyze and organize the following extracted text from notes/whiteboard:\n\n${text}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
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

export async function generateDetailedDocument(notes: any[], summary: string) {
  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that creates detailed, well-structured documents from notes. Create a comprehensive document with proper formatting, headings, and organization.'
        },
        {
          role: 'user',
          content: `Create a detailed document from these notes:\n\nSummary: ${summary}\n\nNotes: ${JSON.stringify(notes, null, 2)}`
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate detailed document');
  }
}
