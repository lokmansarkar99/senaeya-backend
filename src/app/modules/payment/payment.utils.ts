// import { whatsAppTemplate } from '../../../shared/whatsAppTemplate';
// import { S3Helper } from '../../../helpers/aws/s3helper';
import path from 'path';
import fs from 'fs';
import { whatsAppHelper } from '../../../helpers/whatsAppHelper';

// // html-node-pdf ⬇️⬇️
// import htmlToPdf from 'html-pdf-node';
// export const generatePDF = async (htmlContent: string): Promise<string> => {
//      try {
//           const options = {
//                format: 'A4',
//                printBackground: true,
//           };

//           const file = { content: htmlContent };

//           // Generate PDF Buffer properly
//           const pdfBuffer: any = await htmlToPdf.generatePdf(file, options);

//           if (!pdfBuffer) {
//                throw new Error('Failed to generate PDF buffer');
//           }

//           const rollBackToRootUploadDir = path.resolve(__dirname, '../../../../uploads/');
//           const pdfPath = path.join(rollBackToRootUploadDir, 'document', 'invoice.pdf');

//           fs.mkdirSync(path.dirname(pdfPath), { recursive: true });

//           // Save PDF file
//           fs.writeFileSync(pdfPath, pdfBuffer);

//           return pdfPath;
//      } catch (error) {
//           console.error('Error generating PDF:', error);
//           throw new Error('Failed to generate PDF');
//      }
// };

// // puppeter ⬇️⬇️
// import puppeteer from 'puppeteer';
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

// pdf-lib ⬇️⬇️
import { PDFDocument, StandardFonts } from 'pdf-lib';

export const generatePDF = async (htmlContent: string): Promise<string> => {
     const pdfDoc = await PDFDocument.create();
     const page = pdfDoc.addPage();

     const { width, height } = page.getSize();
     const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

     const text = htmlContent.replace(/<[^>]*>/g, ''); // simple HTML → text

     page.drawText(text, {
          x: 20,
          y: height - 40,
          size: 12,
          font,
          lineHeight: 14,
     });

     const pdfBytes = await pdfDoc.save();

     const uploadDir = path.resolve(__dirname, '../../../../uploads/');
     const pdfPath = path.join(uploadDir, 'document', 'invoice.pdf');

     fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
     fs.writeFileSync(pdfPath, pdfBytes);

     return pdfPath;
};

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
