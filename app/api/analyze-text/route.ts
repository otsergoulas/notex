import { NextRequest, NextResponse } from 'next/server';
import { classifyAndSummarize } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { extractedTexts, userInstructions } = body;

    if (!extractedTexts || !Array.isArray(extractedTexts) || extractedTexts.length === 0) {
      return NextResponse.json(
        { error: 'No text provided for analysis' },
        { status: 400 }
      );
    }

    if (!userInstructions) {
      return NextResponse.json(
        { error: 'User instructions are required' },
        { status: 400 }
      );
    }

    console.log(`Analyzing text from ${extractedTexts.length} image(s)...`);
    console.log('User instructions:', userInstructions);

    // Combine all extracted texts for AI analysis
    const combinedText = extractedTexts
      .map((item: { imageNumber: number; text: string }) =>
        `--- Image ${item.imageNumber} ---\n${item.text}`
      )
      .join('\n\n');

    // Classify and summarize using OpenAI
    const analysis = await classifyAndSummarize(
      combinedText,
      userInstructions
    );

    return NextResponse.json({
      summary: analysis.summary,
      actionSteps: analysis.actionSteps,
      keyInsights: analysis.keyInsights,
      notes: analysis.notes,
      categories: analysis.categories,
    });
  } catch (error) {
    console.error('Error analyzing text:', error);
    return NextResponse.json(
      { error: 'Failed to analyze text' },
      { status: 500 }
    );
  }
}
