import { translate } from '@vitalets/google-translate-api';

export async function translateToSpanish(text: string): Promise<string> {
  if (!text || text.trim().length === 0) {
    return text;
  }

  try {
    const result = await translate(text, { to: 'es' });
    return result.text;
  } catch (error) {
    console.warn('Translation error:', error);
    return text;
  }
}
