import { registerEnumType } from '@nestjs/graphql';

export enum OutputFormat {
  CSV = 'csv',
  EXCEL = 'excel',
}

registerEnumType(OutputFormat, {
  name: 'OutputFormat',
  description: 'The output format for document',
});
