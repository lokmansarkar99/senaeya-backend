import fs from "fs";
import QRCode from "qrcode";

/**
 * Build a TLV (Tag-Length-Value) buffer for one field
 * @param tagNum - Numeric tag identifier
 * @param tagValue - String value for this tag
 * @returns Buffer containing [tag][length][value]
 */
function getTLVForValue(tagNum: number, tagValue: string): Buffer {
  const tagBuffer = Buffer.from([tagNum]);
  const valueBuffer = Buffer.from(tagValue, "utf8");
  const lengthBuffer = Buffer.from([valueBuffer.length]);

  return Buffer.concat([tagBuffer, lengthBuffer, valueBuffer]);
}

/**
 * Generate FATOORA QR code for given invoice data
 */
async function generateFatooraQR(): Promise<void> {
  // Replace with your actual invoice data
  const workshopNameArabic = "My Shop LLC";
  const taxVatNumber = "312345678901234";
  const createdAt = "2025-10-30T13:10:00Z";
  const finalCost = "1234.50";
  const invoiceId = "5456654564646";

  // Create TLV buffers for each field
  const tlvBuffers: Buffer[] = [
    getTLVForValue(1, workshopNameArabic),
    getTLVForValue(2, taxVatNumber),
    getTLVForValue(3, createdAt),
    getTLVForValue(4, finalCost),
    getTLVForValue(5, invoiceId),
  ];

  // Concatenate all TLVs into one buffer
  const qrBuffer = Buffer.concat(tlvBuffers);

  // Convert to Base64 (this will be encoded inside the QR)
  const qrBase64 = qrBuffer.toString("base64");
  console.log("✅ Base64 TLV Payload:\n", qrBase64);

  // Generate QR image
  await QRCode.toFile(`${workshopNameArabic}_${invoiceId}_fatoora_qr.png`, qrBase64, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 1,
    scale: 6,
  });
  console.log("🚀 ~ generateFatooraQR ~ result:", result)

  console.log("🎉 QR Code saved as fatoora_qr.png");
}

// Run the generator
generateFatooraQR().catch((err) => {
  console.error("❌ Error generating QR:", err);
});



// command : npx ts-node src/helpers/qrcode/generateFatooraQr.ts