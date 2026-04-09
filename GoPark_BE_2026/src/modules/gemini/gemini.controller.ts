import { Body, Controller, Post, HttpException, HttpStatus } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GenerateDto } from './dto/generate.dto';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('chat')
  async chat(@Body() body: GenerateDto) {
    const { prompt, maxOutputTokens, temperature } = body as GenerateDto;
    if (!prompt) {
      throw new HttpException('prompt is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const text = await this.geminiService.generateText(prompt, maxOutputTokens, temperature);
      return { text };
    } catch (err: any) {
      throw new HttpException(err.message || 'Gemini error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
