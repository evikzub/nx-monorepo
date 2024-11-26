import { PFACommon } from "../../../assets/context/types";
import { ReportValuesProps } from "../../context/values/types";

export interface ReportEPMiniProps {
  css_file: string;
  logo_file: string;
  imagePath: string;
  userName: string;
  fullName: string;
  reportTitle: string;
  reportDate: string;
  commonContext: PFACommon;
  clientProps: {
    buyerMotiveTop1: number;
  };
  valuesProps: ReportValuesProps;
}
