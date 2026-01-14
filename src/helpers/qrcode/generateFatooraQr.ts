import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

/**
 * Build a TLV (Tag-Length-Value) buffer for one field
 * @param tagNum - Numeric tag identifier
 * @param tagValue - String value for this tag
 * @returns Buffer containing [tag][length][value]
 */
export function getTLVForValue(tagNum: number, tagValue: string): Buffer {
     const tagBuffer = Buffer.from([tagNum]);
     const valueBuffer = Buffer.from(tagValue, 'utf8');
     const lengthBuffer = Buffer.from([valueBuffer.length]);

     return Buffer.concat([tagBuffer, lengthBuffer, valueBuffer]);
}

/**
 * Generate FATOORA QR code for given invoice data
 */

export interface IFatooraQr {
     workshopNameArabic: string;
     taxVatNumber: string;
     createdAt: string;
     finalCost: string;
     invoiceId: string;
}
export async function generateFatooraQR(data: IFatooraQr) {
     // Create TLV buffers for each field
     const tlvBuffers: Buffer[] = [
          getTLVForValue(1, data.workshopNameArabic),
          getTLVForValue(2, data.taxVatNumber),
          getTLVForValue(3, data.createdAt),
          getTLVForValue(4, data.finalCost),
          getTLVForValue(5, data.invoiceId),
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
     const fileName = `${data.workshopNameArabic}_${data.invoiceId}_fatoora_qr.png`.replace(/[^a-zA-Z0-9_.-]/g, '_');
     const filePath = path.join(uploadsDir, fileName);

     // Generate QR code
     await QRCode.toFile(filePath, qrBase64, {
          type: 'png',
          errorCorrectionLevel: 'M',
          margin: 1,
          scale: 6,
     });

     console.log(`🎉 QR Code saved at ${filePath}`);
     return `/image/${fileName}`;
}

// Run the generator
generateFatooraQR({
     workshopNameArabic: 'My Shop LLC',
     taxVatNumber: '312345678901234',
     createdAt: '2025-10-30T13:10:00Z',
     finalCost: '1234.50',
     invoiceId: '5456654564646',
}).catch((err) => {
     console.error('❌ Error generating QR:', err);
});

// command : npx ts-node src/helpers/qrcode/generateFatooraQr.ts
