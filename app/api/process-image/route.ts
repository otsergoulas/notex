import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromImage } from '@/lib/vision';
import { classifyAndSummarize } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const images = formData.getAll('images') as File[];
    const userInstructions = formData.get('instructions') as string | null;

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    if (!userInstructions) {
      return NextResponse.json(
        { error: 'User instructions are required' },
        { status: 400 }
      );
    }

    console.log(`Processing ${images.length} image(s)...`);

    const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

    // Extract text from all images
    const extractedTexts: string[] = [];
    const extractedTextsPerImage: { imageNumber: number; text: string }[] = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      console.log(`Extracting text from image ${i + 1}/${images.length}...`);

      // Check image size
      if (image.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: `Image ${i + 1} exceeds 2MB size limit. Images larger than 2MB cannot be processed for text extraction.` },
          { status: 400 }
        );
      }

      // Convert image to buffer
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Extract text using Google Cloud Vision
      const text = await extractTextFromImage(buffer);
      if (text) {
        extractedTexts.push(`--- Image ${i + 1} ---\n${text}`);
        extractedTextsPerImage.push({ imageNumber: i + 1, text });
      }
    }

    if (extractedTexts.length === 0) {
      return NextResponse.json(
        { error: 'No text found in any images' },
        { status: 400 }
      );
    }

    // Combine all extracted texts for AI analysis
    const combinedText = extractedTexts.join('\n\n');
    console.log('Combined extracted text from all images');

    // Classify and summarize using OpenAI
    console.log('Classifying and summarizing notes...');
    console.log('User instructions received:', userInstructions);
    const analysis = await classifyAndSummarize(combinedText, userInstructions);

    return NextResponse.json({
      extractedTexts: extractedTextsPerImage,
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
