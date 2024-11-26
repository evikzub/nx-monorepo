export type ReportData = {
  BelongerTotals: number;
  AchieverTotals: number;
  SocietalTotals: number;
  EmulatorTotals: number;
}

export type BuyerMotiveText = {
  name: string;
  text1: string;
  text2: string;
  text3: string;
  buyerMotiveTop1: string;
  buyerMotiveTop2: string;
}

export type ValuesText = {
  text1: string;
  text2: string;
  text3: string;
  text4: string;
  text5: string;
}

export type HOVText = {
  text1: string;
  text2: string;
  text3: string;
  text4: string;
  text5: string;
  text6: string;
}

export interface ReportValuesProps {
  totals: ReportData;
  rptImagePath: string;
  //otherPFA: any; // Include otherPFA in the report values
  //XMLOutput: any;
  BuyerMotive: BuyerMotiveText;
  ValuesText: ValuesText;
  HOVText: HOVText;
}
