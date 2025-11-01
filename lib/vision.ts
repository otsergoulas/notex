import vision from '@google-cloud/vision';

// Initialize the Vision client with service account credentials
function getVisionClient() {
  // Check if we're using base64 credentials (for deployment)
  const base64Credentials = process.env.GOOGLE_CREDENTIALS_BASE64;

  if (base64Credentials) {
    const credentials = JSON.parse(
      Buffer.from(base64Credentials, 'base64').toString('utf-8')
    );
    return new vision.ImageAnnotatorClient({
      credentials,
    });
  }

  // Fallback to file path (for local development)
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsPath) {
    throw new Error(
      'Either GOOGLE_CREDENTIALS_BASE64 or GOOGLE_APPLICATION_CREDENTIALS must be set'
    );
  }

  return new vision.ImageAnnotatorClient({
    keyFilename: credentialsPath,
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
