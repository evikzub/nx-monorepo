import * as ejs from 'ejs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { ReportConfigProps } from './types/report.config';

import { IReportRenderer } from "./interfaces";

@Injectable()
export class PdfRendererService implements IReportRenderer {
  private readonly logger = new Logger(PdfRendererService.name);

  constructor(
    @Inject('EJS') protected readonly ejsRenderer: typeof ejs
  ) {}

  async renderToHtml(templateName: string, params: any): Promise<string> {
    const templatePath = path.join(
      __dirname,
      'assets',
      'templates',
      templateName,
    );

    return this.ejsRenderer.renderFile(templatePath, params);
  }

  async renderToPdf(html: string, config: ReportConfigProps): Promise<void> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    const baseUrl = `file://${path.resolve(config.assets.logo, '..')}`;
    await page.goto(baseUrl);
    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: path.join(config.assets.output, 'report.pdf'),
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.1in',
        right: '0.4in',
        bottom: '0.275in',
        left: '0.4in',
      },
      displayHeaderFooter: true,
      footerTemplate: `
      <div style="font-size: 10px; font-family: Arial, sans-serif; width: 100%; text-align: center;">
        <span style="color: #666666;">
          ${config.assessment.firstName} ${config.assessment.lastName} - EP Mini - <% reportDate %>
        </span>
        <span style="color: #666666;">
          &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
          Copyright &copy;1993-${new Date().getFullYear()}
          &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
        </span>
        <span style="color: #666666;" class="pageNumber"></span> / <span style="color: #666666;" class="totalPages"></span>
      </div>`,
    });

    await browser.close();
  }
} 