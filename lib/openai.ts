import OpenAI from 'openai';

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  return new OpenAI({ apiKey });
}

export async function classifyAndSummarize(text: string) {
  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that helps organize notes. Your task is to:
1. Identify distinct notes or sections in the text
2. Classify each note by topic/category
3. Create a structured summary

Respond in JSON format:
{
  "notes": [
    {"content": "note text", "category": "category name", "position": 0}
  ],
  "summary": "overall summary of all notes",
  "categories": ["category1", "category2"]
}`
        },
        {
          role: 'user',
          content: `Please analyze and organize the following extracted text from notes/whiteboard:\n\n${text}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
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
