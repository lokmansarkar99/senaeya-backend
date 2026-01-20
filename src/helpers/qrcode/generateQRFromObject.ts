import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { getTLVForValue } from './generateFatooraQr';

const generateQRFromObject = async (data: any) => {
     // /**
     //  * 1 : Sellers's Name
     //  * 2 : Seller's TRN
     //  * 3 : createdAt
     //  * 4 : totalCostIncludingTax
     //  * 5 : taxAmount
     //  */
     // Create TLV buffers for each field
     const tlvBuffers: Buffer[] = [
          getTLVForValue(1, data.workshop.workshopNameEnglish.toString()),
          getTLVForValue(2, data.workshop.taxVatNumber.toString()),
          getTLVForValue(3, data.createdAt.toString()),
          getTLVForValue(4, data.flatDiscountedAmount.toString()),
          getTLVForValue(5, data.flatVatAmount.toString()),
     ];

     // Concatenate all TLVs into one buffer
     const qrBuffer = Buffer.concat(tlvBuffers);

     // Convert to Base64 (this will be encoded inside the QR)
     const qrBase64 = qrBuffer.toString('base64');
     console.log('✅ Base64 TLV Payload:\n', qrBase64);

     // Ensure uploads/image directory exists
     const uploadsDir = path.join(process.cwd(), 'uploads', 'image');
     if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
     }

     // Generate QR image path
     const fileName = `${data.workshop.workshopNameEnglish}_${data._id}_subscription_qr_code.png`.replace(/[^a-zA-Z0-9_.-]/g, '_');
     const filePath = path.join(uploadsDir, fileName);

     // Generate QR code
     await QRCode.toFile(filePath, qrBase64, {
          type: 'png',
          errorCorrectionLevel: 'M',
          margin: 1,
          scale: 6,
     });

     console.log(`🎉 QR Code saved at ${filePath}`);
     return { qrImagePath: `/image/${fileName}` };
};

const generateQRFromObject_old = async (data: any, fileName: string = 'subscription_qr_code') => {
     try {
          // Extract only essential information for the QR code
          const qrData = {
               subscriptionId: data._id?.toString(),
               workshopName: data.workshop?.workshopNameEnglish || 'N/A',
               amountPaid: data.amountPaid,
               status: data.status,
               start: data.currentPeriodStart,
               end: data.currentPeriodEnd,
          };

          // Format the full object data into a table-like string (for display purposes)
          const tableData = `
               subscriptionId : ${qrData.subscriptionId}
               workshopName : ${qrData.workshopName}
               amountPaid : ${qrData.amountPaid}
               status : ${qrData.status}
               start : ${qrData.start}
               end : ${qrData.end}
          `;

          // Ensure uploads/image directory exists
          const uploadsDir = path.join(process.cwd(), 'uploads', 'image');
          if (!fs.existsSync(uploadsDir)) {
               fs.mkdirSync(uploadsDir, { recursive: true });
          }

          // Generate a unique file name
          const safeFileName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_');
          const filePath = path.join(uploadsDir, `${safeFileName}_${Date.now()}.png`);
          const relativePath = `/image/${path.basename(filePath)}`;

          // Generate and save the QR code as an image file
          await QRCode.toFile(filePath, tableData, {
               type: 'png',
               errorCorrectionLevel: 'H',
               margin: 1,
               scale: 8,
          });

          console.log(`✅ QR Code generated at: ${filePath}`);

          return {
               qrImagePath: relativePath,
          };
     } catch (error) {
          console.error('❌ Error generating QR code:', error);
          throw new Error('Failed to generate QR code. The data might be too large.');
     }
};

export { generateQRFromObject_old, generateQRFromObject };
