// import puppeteer from 'puppeteer';
// import { whatsAppTemplate } from '../../../shared/whatsAppTemplate';
// import { S3Helper } from '../../../helpers/aws/s3helper';
import path from 'path';
import fs from 'fs';
import { whatsAppHelper } from '../../../helpers/whatsAppHelper';
import htmlToPdf from 'html-pdf-node'; // Import the html-pdf-node package

export const generatePDF = async (htmlContent: string): Promise<string> => {
     try {
          const options = {
               format: 'A4',
               printBackground: true,
          };

          const file = { content: htmlContent };

          // Generate PDF Buffer properly
          const pdfBuffer: any = await htmlToPdf.generatePdf(file, options);

          if (!pdfBuffer) {
               throw new Error('Failed to generate PDF buffer');
          }

          const rollBackToRootUploadDir = path.resolve(__dirname, '../../../../uploads/');
          const pdfPath = path.join(rollBackToRootUploadDir, 'document', 'invoice.pdf');

          fs.mkdirSync(path.dirname(pdfPath), { recursive: true });

          // Save PDF file
          fs.writeFileSync(pdfPath, pdfBuffer);

          return pdfPath;
     } catch (error) {
          console.error('Error generating PDF:', error);
          throw new Error('Failed to generate PDF');
     }
};

// export const generatePDF = async (htmlContent: string) => {
//      const browser = await puppeteer.launch();
//      const page = await browser.newPage();

//      await page.setContent(htmlContent); // Set HTML content
//      const pdfBuffer = await page.pdf({
//           format: 'A4',
//           printBackground: true,
//      });

//      const rollBackToRootUploadDir = path.resolve(__dirname, '../../../../uploads/');

//      const pdfPath = path.join(rollBackToRootUploadDir, 'document', `invoice.pdf`);

//      // Save the PDF to disk
//      fs.writeFileSync(pdfPath, pdfBuffer);

//      await browser.close();

//      return pdfPath;
// };

// export const releaseInvoiceToWhatsApp = async (updatedInvoice: any) => {
//      const createInvoiceTemplate = whatsAppTemplate.createInvoice(updatedInvoice);
//      const invoiceInpdfPath = await generatePDF(createInvoiceTemplate);
//      const fileBuffer = fs.readFileSync(invoiceInpdfPath);
//      const result = await S3Helper.uploadBufferToS3(fileBuffer, 'pdf', updatedInvoice._id.toString(), 'application/pdf');
//      whatsAppHelper.sendWhatsAppPDFMessage({
//           to: (updatedInvoice.client as any).clientId.contact,
//           priority: 10,
//           referenceId: '',
//           msgId: '',
//           mentions: '',
//           filename: `${updatedInvoice._id.toString()}_invoice.pdf`,
//           document: result,
//           caption: 'Invoice',
//      });
// };

export const releaseInvoiceToWhatsApp = async (updatedInvoice: any) => {
     whatsAppHelper.sendWhatsAppPDFMessage({
          to: (updatedInvoice.client as any).contact,
          priority: 10,
          referenceId: '',
          msgId: '',
          mentions: '',
          filename: `${updatedInvoice._id.toString()}_invoice.pdf`,
          document: updatedInvoice.invoiceAwsLink,
          caption: `Invoice file pdf ${updatedInvoice._id.toString()}
          ملف الفاتورة pdf ${updatedInvoice._id.toString()}
          `,
     });
};
