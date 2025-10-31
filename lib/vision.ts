import vision from '@google-cloud/vision';
import path from 'path';

// Initialize the Vision client with service account credentials
function getVisionClient() {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!credentialsPath) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
  }

  // Resolve the path relative to project root
  const absolutePath = path.isAbsolute(credentialsPath)
    ? credentialsPath
    : path.join(process.cwd(), credentialsPath);

  return new vision.ImageAnnotatorClient({
    keyFilename: absolutePath,
  });
}

export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  try {
    const client = getVisionClient();

    // Perform text detection on the image
    const [result] = await client.textDetection(imageBuffer);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      return '';
    }

    // First annotation contains all detected text
    return detections[0].description || '';
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw error;
  }
}
