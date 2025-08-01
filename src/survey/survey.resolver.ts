import { Args, Query, Resolver } from '@nestjs/graphql';
import { SurveyService } from './survey.service';
import { ExportSurveyDataInput } from './dto/survey.dto';

@Resolver()
export class SurveyResolver {
  constructor(private readonly surveyService: SurveyService) {}

  @Query(() => String, {
    description:
      'Generates and returns student survey data combined into a CSV format (Base64 encoded).',
  })
  async exportSurveyData(
    @Args('input') input: ExportSurveyDataInput,
  ): Promise<string> {
    return await this.surveyService.exportSurveyData(input);
  }
}
