import { PFABuyerMotives, PFACommon } from './types';
import pfaBuyerMotivesJson from './pfa-buyer-motives.json';
import pfaCommonJson from './pfa-common.json';

// Type assertion to ensure JSON matches our interfaces
export const pfaBuyerMotivesData: PFABuyerMotives = pfaBuyerMotivesJson as PFABuyerMotives;
export const pfaCommonData: PFACommon = pfaCommonJson as PFACommon;

// Example usage in your code:
// const section = pfaCommonData.sections.values;
// const motive = pfaBuyerMotivesData.motives['1'];
