import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromImage } from '@/lib/vision';
import { classifyAndSummarize } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const customInstructions = formData.get('instructions') as string | null;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Convert image to buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text using Google Cloud Vision
    console.log('Extracting text from image...');
    const extractedText = await extractTextFromImage(buffer);

    if (!extractedText) {
      return NextResponse.json(
        { error: 'No text found in image' },
        { status: 400 }
      );
    }

    // Classify and summarize using OpenAI
    console.log('Classifying and summarizing notes...');
    console.log('Custom instructions received:', customInstructions || '(none)');
    const analysis = await classifyAndSummarize(extractedText, customInstructions || undefined);

    return NextResponse.json({
      extractedText,
      summary: analysis.summary,
      actionSteps: analysis.actionSteps,
      keyInsights: analysis.keyInsights,
      notes: analysis.notes,
      categories: analysis.categories,
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
