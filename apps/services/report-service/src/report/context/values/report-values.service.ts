import { Injectable } from '@nestjs/common';

import { AssessmentDto } from '@microservices-app/shared/types';

import { pfaCommonData as commonContext } from '../../../assets/context';
import { pfaBuyerMotivesData } from '../../../assets/context';

import { ReportConfigProps } from '../../core/types/report.config';
import { BuyerMotiveText, HOVText, ReportData, ReportValuesProps, ValuesText } from './types';

@Injectable()
export class ReportsValuesService {
  //private readonly logger = new Logger(ReportsValuesService.name);

  private prepareReportData(assessment: AssessmentDto): ReportData {
    // Check if totals exist
    const totals = assessment.data.results.motives.totals;
    if (!totals) {
      throw new Error(
        `Totals not found in assessment data for email: ${assessment.email}`,
      );
    }

    // Extract report data from assessmentData
    return {
      BelongerTotals: totals['1'],
      AchieverTotals: totals['2'],
      SocietalTotals: totals['3'],
      EmulatorTotals: totals['4'],
    };
  }

  private setClientName(text: string, clientName: string): string {
    return text.replace(/#clientname#/g, clientName);
  }

  private renderValuesText(
    assessment: AssessmentDto,
  ): ValuesText {
    return {
      text1: commonContext.data.values_2.text_1,
      text2: commonContext.data.values_2.text_2,
      text3: commonContext.data.values_2.text_3,
      text4: this.setClientName(
        commonContext.data.values_2.text_4,
        assessment.firstName,
      ),
      text5: commonContext.data.values_2.text_5,
    };
  }

  private getClientHOVText(assessment: AssessmentDto): HOVText {
    return {
      text1: assessment.data.results.motives.hov[0].answer,
      text2: assessment.data.results.motives.hov[1].answer,
      text3: assessment.data.results.motives.hov[2].answer,
      text4: assessment.data.results.motives.hov[3].answer,
      text5: assessment.data.results.motives.hov[4].answer,
      text6: assessment.data.results.motives.hov[5].answer,
    };
  }

  private renderBuyerMotives(
    assessment: AssessmentDto,
  ): BuyerMotiveText {
    const xmlData = pfaBuyerMotivesData;
    const clientName = assessment.firstName;
    const numItems = xmlData.types.type.length; // Assuming xmlData is structured correctly

    for (let i = 0; i < numItems; i++) {
      const textstr = xmlData.types.type[i].id; //.replace(/<[^>]*>/g, ''); // Remove HTML tags

      const buyerMotiveTop1 = assessment.data.results.motives.top[1];
      const buyerMotiveTop2 = assessment.data.results.motives.top[2];

      if (textstr.includes(`${buyerMotiveTop1}-${buyerMotiveTop2}`)) {
        //this.logger.log(xmlData.types.type[i].name);
        const motives = (xmlData.types.type[i].name as string).split('-');
        
        // Replace placeholders in text
        return {
          name: xmlData.types.type[i].name as string,
          text1: this.setClientName(
            xmlData.types.type[i].text_1 as string,
            clientName,
          ),
          text2: this.setClientName(
            xmlData.types.type[i].text_2 as string,
            clientName,
          ),
          text3: this.setClientName(
            xmlData.types.type[i].text_3 as string,
            clientName,
          ),
          buyerMotiveTop1: motives[0].toUpperCase(),
          buyerMotiveTop2: motives[1].toUpperCase(),
        };
      }
    }

    throw new Error('No buyer motives found');
  }

  public generateValuesReport(
    config: ReportConfigProps
  ): ReportValuesProps {
    return {
      totals: this.prepareReportData(config.assessment),
      rptImagePath: 'images', //config.rptImagePath,
      BuyerMotive: this.renderBuyerMotives(config.assessment),
      ValuesText: this.renderValuesText(config.assessment),
      HOVText: this.getClientHOVText(config.assessment),
    };
  }
}
