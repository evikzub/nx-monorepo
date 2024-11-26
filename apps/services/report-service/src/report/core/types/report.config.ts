import { AssessmentDto } from '@microservices-app/shared/types';

export type ReportAssetProps = {
  css: string;
  logo: string;
  images: string;
  //json: string;
  templates: string;
  output: string;
}

export type ReportConfigProps = {
  assessment: AssessmentDto;
  reportTemplate: string;
  assets: ReportAssetProps;
}
