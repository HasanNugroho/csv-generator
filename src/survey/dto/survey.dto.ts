import { Field, InputType, Int, ID } from '@nestjs/graphql';
import {
  IsInt,
  IsIn,
  IsOptional,
  IsArray,
  IsString,
  IsEnum,
} from 'class-validator';
import { OutputFormat } from 'src/common/enum';

@InputType()
export class GenerateCsvInput {
  @Field(() => Int, {
    nullable: true,
    description: 'The pre-defined ID group to filter students (1, 2, or 3).',
  })
  @IsOptional()
  @IsInt({ message: 'Group ID must be an integer.' })
  @IsIn([1, 2, 3], { message: 'Group ID must be 1, 2, or 3.' })
  groupId?: number;

  @Field(() => [ID], {
    nullable: true,
    description:
      'A custom list of student IDs to include in the CSV. Cannot be used with groupId.',
  })
  @IsOptional()
  @IsArray({ message: 'Custom student IDs must be an array.' })
  @IsString({ each: true, message: 'Each custom student ID must be a string.' })
  customStudentIds?: string[];

  @Field(() => OutputFormat, {
    nullable: true,
    description:
      'The desired output format (csv or excel). Defaults to csv if not provided.',
  })
  @IsOptional()
  @IsEnum(OutputFormat, {
    message: 'Invalid format. Must be "csv" or "excel".',
  })
  format: OutputFormat = OutputFormat.CSV;
}
