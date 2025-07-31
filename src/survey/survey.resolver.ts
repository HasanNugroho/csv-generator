import { Args, Query, Resolver } from '@nestjs/graphql';
import { SurveyService } from './survey.service';
import { BadRequestException } from '@nestjs/common';
import { GenerateCsvInput } from './dto/survey.dto';

@Resolver()
export class SurveyResolver {
  constructor(private readonly surveyService: SurveyService) {}

  @Query(() => String, {
    description:
      'Generates and returns student survey data combined into a CSV format (Base64 encoded).',
  })
  async generateCsv(@Args('input') input: GenerateCsvInput): Promise<string> {
    return await this.surveyService.getSurveyData(input);
  }
}
