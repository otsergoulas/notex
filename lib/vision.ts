import vision from '@google-cloud/vision';

// Initialize the Vision client with service account credentials
function getVisionClient() {
  // Option 1: JSON string directly (simplest for Vercel)
  const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
  if (credentialsJson) {
    try {
      const credentials = JSON.parse(credentialsJson);
      return new vision.ImageAnnotatorClient({
        credentials,
      });
    } catch (error) {
      console.error('Failed to parse GOOGLE_CREDENTIALS_JSON:', error);
      throw new Error('Invalid GOOGLE_CREDENTIALS_JSON format');
    }
  }

  // Option 2: Base64 encoded credentials
  const base64Credentials = process.env.GOOGLE_CREDENTIALS_BASE64;
  if (base64Credentials) {
    try {
      const decodedString = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      console.log('Decoded credentials length:', decodedString.length);
      console.log('First 100 chars:', decodedString.substring(0, 100));

      const credentials = JSON.parse(decodedString);
      return new vision.ImageAnnotatorClient({
        credentials,
      });
    } catch (error) {
      console.error('Failed to parse Google credentials from base64:', error);
      console.error('Base64 string length:', base64Credentials.length);
      console.error('Base64 first 50 chars:', base64Credentials.substring(0, 50));
      throw new Error('Invalid GOOGLE_CREDENTIALS_BASE64 format');
    }
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
