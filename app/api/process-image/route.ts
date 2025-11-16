import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromImage } from '@/lib/vision';
import { analyzeText } from '@/lib/openai';
import sharp from 'sharp';

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

    const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 2MB in bytes

    // Extract text from all images
    const extractedTexts: string[] = [];
    const extractedTextsPerImage: { imageNumber: number; text: string }[] = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      console.log(`Extracting text from image ${i + 1}/${images.length}...`);

      // Convert image to buffer
      const bytes = await image.arrayBuffer();
      let buffer = Buffer.from(bytes);

      // Compress image if it exceeds size limit
      if (image.size > MAX_IMAGE_SIZE) {
        console.log(`Image ${i + 1} is ${(image.size / 1024 / 1024).toFixed(2)}MB, compressing...`);

        let quality = 80;
        let compressedBuffer = buffer;

        // Try compressing with decreasing quality until under 2MB
        while (compressedBuffer.length > MAX_IMAGE_SIZE && quality > 10) {
          compressedBuffer = await sharp(buffer)
            .jpeg({ quality })
            .toBuffer();

          if (compressedBuffer.length > MAX_IMAGE_SIZE) {
            quality -= 10;
          }
        }

        buffer = compressedBuffer;
        console.log(`Compressed to ${(buffer.length / 1024 / 1024).toFixed(2)}MB with quality ${quality}`);
      }

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

    // Analyze using OpenAI
    console.log('Analyzing notes...');
    console.log('User instructions received:', userInstructions);
    const analysis = await analyzeText(combinedText, userInstructions);

    return NextResponse.json({
      extractedTexts: extractedTextsPerImage,
      response: analysis.response,
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
