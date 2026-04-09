import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly apiKey: string;
  private readonly model: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('GOOGLE_API_KEY') || '';
    this.model = this.config.get<string>('GOOGLE_GEMINI_MODEL') || 'models/text-bison-001';
  }

  async generateText(prompt: string, maxOutputTokens = 512, temperature = 0.2) {
    if (!this.apiKey) {
      throw new Error('GOOGLE_API_KEY not set in environment');
    }

    const url = `https://generativelanguage.googleapis.com/v1/${this.model}:generateText?key=${this.apiKey}`;

    const body = {
      prompt: { text: prompt },
      temperature,
      maxOutputTokens,
    } as any;

    this.logger.debug(`Calling Gemini API ${this.model}`);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const t = await res.text();
      this.logger.error(`Gemini API error: ${res.status} ${t}`);
      throw new Error(`Gemini API error: ${res.status} ${t}`);
    }

    const data = await res.json();

    // Try to extract the text from common response shapes
    const candidates = data.candidates || data.output?.candidates || [];
    if (Array.isArray(candidates) && candidates.length > 0) {
      // common field names: "output", "content", "text"
      const c0 = candidates[0];
      if (typeof c0.output === 'string') return c0.output;
      if (typeof c0.content === 'string') return c0.content;
      if (c0.text) return c0.text;
      if (Array.isArray(c0)) return c0.join('\n');
      // deeper look
      if (c0.outputText) return c0.outputText;
    }

    // Fallback: try top-level fields
    if (data.output?.text) return data.output.text;
    if (data.text) return data.text;

    // As last resort, return JSON string
    return JSON.stringify(data);
  }
}
