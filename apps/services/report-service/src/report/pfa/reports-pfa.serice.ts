// import { Inject, Injectable, Logger } from '@nestjs/common';

// import * as ejs from 'ejs';
// import * as fs from 'fs';
// import * as path from 'path';
// import * as puppeteer from 'puppeteer';

// import { ReportConfigProps } from '../core/types/report.config';
// import { ReportsPFAValuesService } from './report-pfa-values.service';
// import { pfaCommonData as commonContext } from '../../assets/context';
// import { PFACommon } from '../../assets/context/types';
// import { ReportValuesProps } from '../context/values/types';

// // Import ejs

// interface ReportPFAProps {
//   css_file: string;
//   logo_file: string;
//   imagePath: string;
//   userName: string;
//   fullName: string;
//   reportTitle: string;
//   reportDate: string;
//   commonContext: PFACommon;
//   clientProps: {
//     buyerMotiveTop1: number;
//   };
//   valuesProps: ReportValuesProps;
// }

// @Injectable()
// export class ReportsPFAService {
//   private readonly logger = new Logger(ReportsPFAService.name); // Initialize NestJS Logger

//   constructor(
//     @Inject('EJS') private readonly ejsRenderer: typeof ejs,
//     private readonly reportsPFAValuesService: ReportsPFAValuesService,
//   ) {}

//   private getReportTitle(): string {
//     //// rptVersion: string, franchisorID: string
//     // if (rptVersion === "EP") {
//     //   return franchisorID === "110145"
//     //     ? "ENTREPRENEUR READINESS PROFILE"
//     //     : "ENTREPRENEUR PROFILE";
//     // } else {
//     //   return franchisorID === "110145"
//     //     ? "FRANCHISE READINESS ASSESSMENT"
//     //     : "PERSONAL FRANCHISE ASSESSMENT";
//     // }
//     return 'ENTREPRENEUR PROFILE';
//   }

//   private getReportLogo(rptLogoPath: string): string {
//     return `${rptLogoPath}/entrepreneurprofile_logo.jpg`;
//   }

//   // private getReportContext(rptJsonPath: string): string {
//   //   return jsonLoad(`${rptJsonPath}/pfa-common.json`);
//   // }

//   private getReportParams(config: ReportConfigProps): ReportPFAProps {
//     const logoFile = 'logos/entrepreneurprofile_logo.jpg'; // it works for pdf
//     //const logoFile = '../logos/entrepreneurprofile_logo.jpg'; // it works for html
//     this.logger.log(
//       `Logo file path: ${path.join(config.assets.logo, logoFile)}`,
//     );

//     //const commonContext = pfaCommonData; //this.getReportContext(config.rptJsonPath);

//     return {
//       css_file: path.join(config.assets.css, 'pdf.css'),
//       logo_file: logoFile, // Relative to the base URL
//       imagePath: 'images', //config.rptImagePath,
//       userName: config.assessment.firstName,
//       fullName: `${config.assessment.firstName} ${config.assessment.lastName}`,
//       reportTitle: this.getReportTitle(),
//       reportDate: new Date().toDateString(),
//       commonContext,
//       clientProps: {
//         buyerMotiveTop1: config.assessment.data?.results?.motives?.top?.[1],
//       },
//       valuesProps: this.reportsPFAValuesService.generateValuesReport(
//         config,
//         //commonContext,
//       ),
//     };
//   }

//   async createReportPFA(config: ReportConfigProps) {
//     const reportParams = this.getReportParams(config);
//     //console.log(reportParams);
//     //console.log(reportParams.clientProps);

//     try {
//       const templatePath = path.join(
//         __dirname,
//         'assets',
//         'templates',
//         'pfa-report-template.ejs',
//       );

//       const html = await this.ejsRenderer.renderFile(
//         templatePath,
//         reportParams,
//       );

//       // Write HTML to a file (optional)
//       fs.writeFileSync(`${config.assets.output}/output.html`, html);
//       // Convert HTML to PDF
//       await this.convertHtmlToPdf(html, config);
//     } catch (error) {
//       console.error('Error rendering template:', error);
//       throw error;
//     }
//   }

//   private async convertHtmlToPdf(html: string, config: ConfigProps) {
//     //const browser = await puppeteer.launch();
//     const browser = await puppeteer.launch({
//       headless: true,
// //      executablePath: '/usr/bin/chromium', // Adjust path based on your image
//       args: ['--no-sandbox', '--disable-setuid-sandbox'] // Avoid issues with sandboxing
//     });
//     const page = await browser.newPage();

//     // Set the base URL for relative paths
//     const baseUrl = `file://${path.resolve(config.assets.logo, '..')}`;
//     await page.goto(baseUrl);
//     //this.logger.log(`baseUrl: ${baseUrl}`);

//     // Set the content of the page with the HTML
//     await page.setContent(html, { waitUntil: 'networkidle0' });

//     // // Inject the CSS into the page
//     // const cssPath = path.join(config.rptCSSPath, 'pdf.css');
//     // this.logger.log(`cssPath: ${cssPath}`);
//     // const css = fs.readFileSync(cssPath, 'utf8');
//     // await page.evaluate((css) => {
//     //   const style = document.createElement('style');
//     //   style.textContent = css;
//     //   document.head.append(style);
//     // }, css);

//     //// Wait for images to load
//     // await page.evaluate(async () => {
//     //   const selectors = Array.from(document.querySelectorAll('img'));
//     //   await Promise.all(
//     //     selectors.map((img) => {
//     //       if (img.complete) return;
//     //       return new Promise((resolve, reject) => {
//     //         img.addEventListener('load', resolve);
//     //         img.addEventListener('error', (e) => {
//     //           console.error(`Failed to load image: ${img.src}`, e);
//     //           reject(e);
//     //         });
//     //       });
//     //     }),
//     //   );
//     // });

//     this.logger.log(`Generating PDF to ${config.assets.output}`);
//     // Generate PDF
//     await page.pdf({
//       path: path.join(config.assets.output, 'report.pdf'),
//       format: 'A4',
//       printBackground: true,
//       margin: {
//         top: '0.1in', //'50px',
//         right: '0.4in', //'20px',
//         bottom: '0.275in', //'50px',
//         left: '0.4in', //'20px',
//       },
//       displayHeaderFooter: true,
//       footerTemplate: `
//       <div style="font-size: 10px; font-family: Arial, sans-serif; width: 100%; text-align: center;">
//         <span style="color: #666666;">
//           ${config.assessment.firstName} ${config.assessment.lastName} - EP - <% reportDate %>
//         </span>
//         <span style="color: #666666;">
//           &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
//           Copyright &copy;1993-${new Date().getFullYear()}
//           &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
//         </span>
//         <span style="color: #666666;" class="pageNumber"></span> / <span style="color: #666666;" class="totalPages"></span>
//       </div>`,
//       // footerTemplate: `
//       // <center>
//       // 	<font color="666666" size="-1" face="arial">
//       // 		${config.assessment.firstName} ${config.assessment.lastName} - EP - <%= reportDate %>
//       //     <!-- cfif isDefined("var.languageCode") AND var.languageCode IS "de">#DateFormat(DS.DateCompleted, 'DD-MM-YY')#<cfelse>#DateFormat(DS.DateCompleted, 'MM-DD-YY')#</cfif -->
//       // 		&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
//       // 		Copyright &copy;1993-${new Date().getFullYear()}
//       // 		&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
//       //     <span class="pageNumber"></span> / <span class="totalPages"></span>
//       // 	</font>
//       // </center>`,
//     });

//     await browser.close();
//   }
// }
