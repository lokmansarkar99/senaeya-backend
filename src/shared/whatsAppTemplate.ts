import { IInvoice, TranslatedFieldEnum } from '../app/modules/invoice/invoice.interface';
import { buildTranslatedField } from '../utils/buildTranslatedField';


const createAccount = (values: { name: string; otp: number; contact: string }) => {
     return `Hello ${values.name},
     Your single use code is: ${values.otp}
     This code is valid for 3 minutes.
     `;
};

const forgetPassword = (values: { name: string; password: string; contact: string }) => {
     return `Hello ${values.name},
     Your password is: ${values.password}
     `;
};

const getRecieveCar = (values: { contact: string }) => {
     return `Hello,
     Please come to the workshop to receive your car.
     `;
};

const createInvoice = async (updatedInvoice: IInvoice, lang: TranslatedFieldEnum) => {
     console.log('🚀 ~ createInvoice ~ updatedInvoice:', updatedInvoice);
     let titleTag = 'Invoice Report - فاتورة ضريبية مبسطة';
     let invoiceTitle = 'Simplified Tax Invoice';
     let simplifiedLable = 'ورة ضريبية مبسطة';
     let invoiceNo = 'Invoice No.';
     let invoiceDate = 'Invoice Date';
     let client = 'Client';

    //  const [titleTagObj, invoiceTitleObj, simplifiedLableObj, invoiceNoObj, invoiceDateObj, clientObj]: any = await Promise.all([
    //       buildTranslatedField(titleTag as any),
    //       buildTranslatedField(invoiceTitle as any),
    //       buildTranslatedField(simplifiedLable as any),
    //       buildTranslatedField(invoiceNo as any),
    //       buildTranslatedField(invoiceDate as any),
    //       buildTranslatedField(client as any),
    //  ]);

    //  // modify the fields as per require translation
    //  titleTag = titleTagObj[lang];
    //  invoiceTitle = invoiceTitleObj[lang];
    //  simplifiedLable = simplifiedLableObj[lang];
    //  invoiceNo = invoiceNoObj[lang];
    //  invoiceDate = invoiceDateObj[lang];
    //  client = clientObj[lang];

     return `
     <!DOCTYPE html>
     <html lang="${lang}" dir="rtl">
     <head>
         <meta charset="UTF-8">
         <meta name="viewport" content="width=device-width, initial-scale=1.0">
         <title>${titleTag}</title>
         <style>
             * {
                 margin: 0;
                 padding: 0;
                 box-sizing: border-box;
             }
 
             body {
                 font-family: Arial, sans-serif;
                 background-color: #f3f3f3;
                 padding: 20px;
             }
 
             .invoice-container {
                 max-width: 800px;
                 margin: 0 auto;
                 background-color: #ffffff;
                 padding: 30px;
             }
 
             /* Header Section */
             .header {
                 display: flex;
                 justify-content: space-between;
                 align-items: flex-start;
                 margin-bottom: 20px;
             }
 
             .header-left {
                 display: flex;
                 gap: 15px;
                 align-items: flex-start;
             }
 
             .logo {
                 width: 80px;
                 height: 80px;
             }
 
             .qr-code {
                 width: 80px;
                 height: 80px;
                 border: 1px solid #000;
             }
 
             .header-right {
                 text-align: right;
             }
 
             .company-name {
                 font-size: 20px;
                 font-weight: bold;
                 margin-bottom: 5px;
             }
 
             .company-subtitle {
                 font-size: 12px;
                 margin-bottom: 3px;
             }
 
             .company-details {
                 font-size: 11px;
                 line-height: 1.6;
             }
 
             /* Invoice Info Section */
             .invoice-info {
                 display: flex;
                 justify-content: space-between;
                 align-items: center;
                 margin-bottom: 20px;
                 padding-bottom: 15px;
                 border-bottom: 1px solid #ddd;
             }
 
             .invoice-left {
                 text-align: left;
             }
 
             .invoice-label {
                 font-size: 11px;
                 color: #666;
             }
 
             .invoice-value {
                 font-size: 12px;
                 color: #cb3c40;
                 font-weight: bold;
             }
 
             .invoice-center {
                 text-align: center;
             }
 
             .simplified-label {
                 font-size: 10px;
                 color: #666;
                 margin-bottom: 3px;
             }
 
             .invoice-title {
                 font-size: 16px;
                 font-weight: bold;
                 margin-bottom: 8px;
             }
 
             .payment-type {
                 font-size: 13px;
                 color: #cb3c40;
                 font-weight: bold;
             }
 
             .invoice-right {
                 text-align: right;
             }
 
             .license-box {
                 border: 2px solid #000;
                 padding: 8px 12px;
                 display: inline-block;
                 text-align: center;
             }
 
             .license-number {
                 font-size: 18px;
                 font-weight: bold;
                 margin-bottom: 5px;
             }
 
             .license-details {
                 display: flex;
                 gap: 10px;
                 border-top: 1px solid #000;
                 padding-top: 5px;
             }
 
             .license-cell {
                 text-align: center;
                 font-size: 14px;
                 font-weight: bold;
             }
 
             .license-divider {
                 width: 1px;
                 background-color: #000;
             }
 
             .license-arabic {
                 writing-mode: vertical-rl;
                 text-orientation: mixed;
                 font-size: 12px;
             }
 
             /* Vehicle Section */
             .vehicle-section {
                 display: flex;
                 justify-content: space-between;
                 align-items: center;
                 margin-bottom: 20px;
                 padding: 15px 0;
                 border-bottom: 1px solid #ddd;
             }
 
             .vehicle-left {
                 display: flex;
                 align-items: center;
                 gap: 20px;
             }
 
             .toyota-logo {
                 width: 50px;
                 height: 50px;
             }
 
             .vehicle-info {
                 display: flex;
                 gap: 30px;
                 font-size: 18px;
                 font-weight: bold;
             }
 
             .vehicle-right {
                 display: flex;
                 gap: 30px;
                 font-size: 11px;
             }
 
             .vehicle-detail {
                 text-align: right;
             }
 
             .vehicle-detail-label {
                 color: #666;
             }
 
             .vehicle-detail-value {
                 font-weight: bold;
             }
 
             /* Tables */
             .table-container {
                 margin-bottom: 30px;
             }
 
             table {
                 width: 100%;
                 border-collapse: collapse;
             }
 
             thead {
                 background-color: #1771b7;
                 color: #ffffff;
             }
 
             th {
                 padding: 10px;
                 text-align: center;
                 font-size: 13px;
                 font-weight: bold;
                 border: 1px solid #1771b7;
             }
 
             tbody tr {
                 background-color: #eeeeee;
                 height: 40px;
             }
 
             tbody tr:nth-child(even) {
                 background-color: #f8f8f8;
             }
 
             td {
                 padding: 10px;
                 text-align: center;
                 font-size: 12px;
                 border: 1px solid #ddd;
             }
 
             .summary-section {
                 flex: 1;
             }
 
             .summary-row {
                 display: flex;
                 justify-content: space-between;
                 align-items: center;
                 margin-bottom: 8px;
                 border: 1px solid #ddd;
             }
 
             .summary-label {
                 background-color: #cb3c40;
                 color: #ffffff;
                 padding: 8px 15px;
                 font-size: 12px;
                 flex: 1;
                 text-align: center;
             }
 
             .summary-value {
                 background-color: #ffffff;
                 padding: 8px 15px;
                 font-size: 12px;
                 flex: 1;
                 text-align: center;
                 font-weight: bold;
             }
 
             .total-row .summary-label {
                 background-color: #1771b7;
             }
 
             /* Bottom Bar */
             .bottom-bar {
                 margin-top: 30px;
                 display: flex;
                 justify-content: space-between;
                 align-items: center;
                 background-color: #1771b7;
                 padding: 15px 20px;
                 color: #ffffff;
             }
 
             .thank-you {
                 font-size: 12px;
                 line-height: 1.5;
             }
 
             .contact-bar {
                 background-color: #cb3c40;
                 padding: 10px 20px;
                 display: flex;
                 justify-content: space-between;
                 align-items: center;
                 color: #ffffff;
                 font-size: 12px;
             }
 
             .phone-number {
                 background-color: #cb3c40;
                 padding: 8px 16px;
                 border-radius: 4px;
                 font-weight: 700;
             }
 
             .location {
                 font-weight: 600;
             }
         </style>
     </head>
     <body>
         <div class="invoice-container">
             <div class="header">
                 <div class="header-left">
                     <svg class="logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                         <circle cx="50" cy="35" r="15" fill="none" stroke="#f4c430" stroke-width="4"/>
                         <circle cx="50" cy="35" r="8" fill="none" stroke="#f4c430" stroke-width="3"/>
                     </svg>
                     <div class="qr-code">
                         <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                             <rect width="100" height="100" fill="#fff"/>
                             <rect x="5" y="5" width="25" height="25" fill="#000"/>
                         </svg>
                     </div>
                 </div>
                 <div class="header-right">
                     <div class="company-name">مركز محمد لصيانة السيارات</div>
                     <div class="company-subtitle">مؤسسة محمد علي التجارية</div>
                     <div class="company-details">
                         <div>سجل تجاري <span style="margin-left: 10px;">CR No.</span></div>
                         <div>رقم الضريبي <span style="margin-left: 10px;">VAT No.</span></div>
                     </div>
                 </div>
             </div>
 
             <div class="invoice-info">
                 <div class="invoice-left">
                     <div>
                         <span class="invoice-label">${invoiceNo}</span>
                         <div class="invoice-value">${updatedInvoice._id || ''}</div>
                     </div>
                     <div style="margin-top: 10px;">
                         <span class="invoice-label">${invoiceDate}</span>
                         <div class="invoice-value">${new Date(updatedInvoice.createdAt).toLocaleDateString() || ''}</div>
                     </div>
                 </div>
                 <div class="invoice-center">
                     <div class="simplified-label">${simplifiedLable}</div>
                     <div class="invoice-title">${invoiceTitle}</div>
                     <div class="payment-type">${updatedInvoice.paymentMethod || ''}</div>
                 </div>
                 <div class="invoice-right">
                     <div class="license-box">
                         <div class="license-number">KW-695048</div>
                     </div>
                 </div>
             </div>
 
             <!-- Vehicle Section -->
             <div class="vehicle-section">
                 <div class="vehicle-left">
                     <div class="vehicle-info">
                         <span>Car Model</span>
                         <span>2020</span>
                     </div>
                 </div>
                 <div class="vehicle-right">
                     <div class="vehicle-detail">
                         <div class="vehicle-detail-label">${client}</div>
                         <div class="vehicle-detail-value">${updatedInvoice.client || ''}</div>
                     </div>
                 </div>
             </div>
 
             <!-- Works Table -->
             <div class="table-container">
                 <table>
                     <thead>
                         <tr>
                             <th>N</th>
                             <th>Code</th>
                             <th>Works</th>
                             <th>Quantity</th>
                             <th>Price</th>
                             <th>Total</th>
                         </tr>
                     </thead>
                     <tbody>
                         ${
                              updatedInvoice.worksList
                                   ? updatedInvoice.worksList
                                          .map(
                                               (work: any, index: any) => `
                             <tr>
                                 <td>${index + 1}</td>
                                 <td>${work._id}</td>
                                 <td>${work.work}</td>
                                 <td>${work.quantity}</td>
                                 <td>${work.finalCost}</td>
                                 <td>${work.finalCost * work.quantity}</td>
                             </tr>
                         `,
                                          )
                                          .join('')
                                   : ''
                         }
                     </tbody>
                 </table>
             </div>
 
             <!-- Spare Parts Table -->
             <div class="table-container">
                 <table>
                     <thead>
                         <tr>
                             <th>N</th>
                             <th>Code</th>
                             <th>Spare Parts</th>
                             <th>Quantity</th>
                             <th>Price</th>
                             <th>Total</th>
                         </tr>
                     </thead>
                     <tbody>
                         ${
                              updatedInvoice.sparePartsList
                                   ? updatedInvoice.sparePartsList
                                          .map(
                                               (part: any, index: any) => `
                             <tr>
                                 <td>${index + 1}</td>
                                 <td>${part._id}</td>
                                 <td>${part.work}</td>
                                 <td>${part.quantity}</td>
                                 <td>${part.finalCost}</td>
                                 <td>${part.finalCost * part.quantity}</td>
                             </tr>
                         `,
                                          )
                                          .join('')
                                   : ''
                         }
                     </tbody>
                 </table>
             </div>
 
             <!-- Summary Section -->
             <div class="summary-section">
                 <div class="summary-row total">
                     <div class="summary-label">Total Cost</div>
                     <div class="summary-value">${updatedInvoice.totalCostIncludingTax || ''}</div>
                 </div>
                 <div class="summary-row">
                     <div class="summary-label">Tax</div>
                     <div class="summary-value">${updatedInvoice.taxAmount || ''}</div>
                 </div>
                 <div class="summary-row">
                     <div class="summary-label">Discount</div>
                     <div class="summary-value">${updatedInvoice.finalDiscountInFlatAmount || ''}</div>
                 </div>
                 <div class="summary-row">
                     <div class="summary-label">Total After Discount</div>
                     <div class="summary-value">${updatedInvoice.finalCost || ''}</div>
                 </div>
             </div>
 
             <!-- Footer Section -->
             <div class="footer">
                 <div class="footer-left">
                     You can issue multiple reports via Senaeya App. Daily - Weekly - Monthly - Annual Report.
                 </div>
                 <div class="footer-right">
                     <span class="phone-number">966-5xxxxxxxx</span>
                 </div>
             </div>
         </div>
     </body>
     </html>
     `;
};

const createReport = (report: any) => {
     const saved = report?.numberOfUnpaidNonPostpaidInvoices ?? 0;
     const postpaid = report?.numberOfUnpaidPostpaidInvoices ?? 0;
     const completed = report?.numberOfPaidInvoices ?? 0;

     const collected = Number(report?.totalIncomeCollected ?? 0);
     const recorded = Number(report?.totalAllIncomeRecorded ?? 0);
     const postpaidSaved = Math.max(0, recorded - collected);
     const expenses = Number(report?.totalExpenses ?? 0);

     const balCollected = Number(report?.collectedFinancialBalance ?? collected - expenses);
     const balRecorded = Number(report?.recordedFinancialBalance ?? recorded - expenses);

     const cars = report?.numberOfCars ?? 0;

     const s = report?.range?.start ? new Date(report.range.start) : null;
     const e = report?.range?.end ? new Date(report.range.end) : null;
     const fmtDate = (x: Date) => `${String(x.getDate()).padStart(2, '0')}-${String(x.getMonth() + 1).padStart(2, '0')}-${x.getFullYear()}`;
     const dur = s && e ? Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1) : undefined;
     const dateRange = s && e ? `From ${fmtDate(s)} to ${fmtDate(e)}${dur ? ` Duration: ${dur} days` : ''}` : '';

     const fmt = (n: number) =>
          n.toLocaleString(undefined, {
               minimumFractionDigits: 2,
               maximumFractionDigits: 2,
          });

     return `<!doctype html><html lang="ar" dir="rtl"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Financial Report - Senaeya App</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
  body{font-family:'Cairo',Arial,Helvetica,sans-serif;background:#f4f5f7;color:#000;margin:0}
  .c{max-width:1100px;margin:0 auto;background:#fff}
  .h{background:#1771b7;color:#fff;padding:20px 28px;text-align:center}
  .h h1{margin:0;font-size:24px}.h p{margin:6px 0 0;font-size:14px}
  .v{background:#cb3c40;color:#fff;padding:8px 28px;display:flex;justify-content:space-between;font:600 13px Arial}
  .cnt{padding:24px 28px}
  .t{color:#1771b7;font:700 22px Arial;text-align:right;margin:0 0 18px}
  .dr{background:#d1d1d1;padding:12px 18px;text-align:center;font:700 16px Arial;border-radius:4px;margin:0 0 18px}
  .g{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:0 0 18px}
  .card{background:#f4f5f7;padding:18px;text-align:center;border-radius:4px}
  .lb{font:600 14px Arial;margin:0 0 8px}
  .r .lb{color:#cb3c40}.o .lb{color:#ff9900}.gr .lb{color:#11c84e}
  .val{font:700 34px Arial}
  .r .val{color:#cb3c40}.o .val{color:#ff9900}.gr .val{color:#11c84e}
  .bar{display:flex;justify-content:space-between;align-items:center;padding:16px 22px;border-radius:4px;color:#fff;margin:0 0 12px}
  .b{background:#1771b7}.rr{background:#cb3c40}.gy{background:#959595}
  .amt{display:flex;align-items:center;gap:10px;font:700 26px Arial}.cur{font-size:22px}
  .lbl{font:600 16px Arial}
  .bg{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin:22px 0}
  .bx{padding:18px;border-radius:4px;text-align:center}
  .bu{background:#f0f7fc}.re{background:#fcf0f0}
  .bt{font:700 18px Arial;margin:0 0 10px}.bu .bt{color:#1771b7}.re .bt{color:#cb3c40}
  .fml{font:600 12px Arial}
  .bam{display:flex;justify-content:center;gap:10px;font:700 28px Arial;margin-top:10px}
  .car{background:#d1d1d1;padding:16px 22px;display:flex;justify-content:space-between;align-items:center;border-radius:4px;margin:0 0 18px}
  .cl{font:700 18px Arial}.cv{font:700 24px Arial}
  .ft{background:#1771b7;color:#fff;padding:14px 28px;display:flex;justify-content:space-between;align-items:center;font:400 13px Arial}
  .ph{background:#cb3c40;padding:6px 12px;border-radius:4px;font:700 13px Arial}
  @media(max-width:760px){.g{grid-template-columns:1fr}.bg{grid-template-columns:1fr}.bar,.car,.ft{flex-direction:column;gap:8px;text-align:center}.h{padding:16px 20px}.v{padding:8px 20px}.cnt{padding:20px}.t{font-size:18px}}
  </style></head>
  <body><div class="c">
    <div class="h"><h1>مركز محمد لصيانة السيارات</h1><p>مؤسسة محمد علي التجارية</p></div>
    <div class="v"><span>VAT - 3xxxxxxxxxxxxxx3</span><span>CR - 1010347328</span></div>
    <div class="cnt">
      <h2 class="t">Report issued by Senaeya App</h2>
      <div class="dr">${dateRange}</div>
      <div class="g">
        <div class="card r"><div class="lb">Number of<br>saved invoices</div><div class="val">${saved}</div></div>
        <div class="card o"><div class="lb">Number of<br>Postpaid Invoices</div><div class="val">${postpaid}</div></div>
        <div class="card gr"><div class="lb">Number of<br>completed invoices</div><div class="val">${completed}</div></div>
      </div>
      <div class="bar b"><div class="amt"><span class="cur">﷼</span><span>${fmt(collected)}</span></div><div class="lbl">Total income collected</div></div>
      <div class="bar rr"><div class="amt"><span class="cur">﷼</span><span>${fmt(postpaidSaved)}</span></div><div class="lbl">Total postpaid and saved income</div></div>
      <div class="bar gy"><div class="amt"><span class="cur">﷼</span><span>${fmt(expenses)}</span></div><div class="lbl">Total expenses paid</div></div>
      <div class="bg">
        <div class="bx bu"><div class="bt">Collected financial balance</div><div class="fml">All income collected</div><div class="fml">-</div><div class="fml">All expenses paid</div><div class="bam"><span class="cur">﷼</span><span>${fmt(balCollected)}</span></div></div>
        <div class="bx re"><div class="bt">Recorded financial balance</div><div class="fml">All income recorded</div><div class="fml">-</div><div class="fml">All expenses paid</div><div class="bam"><span class="cur">﷼</span><span>${fmt(balRecorded)}</span></div></div>
      </div>
      <div class="car"><div class="cl">Cars</div><div class="cv">${cars}</div><div class="cl">Number of cars serviced</div></div>
    </div>
    <div class="ft"><div>You can issue multiple reports via Senaeya App.<br>Daily - Weekly - Monthly - Annual Report - and more</div><div><span class="ph">966-5xxxxxxxx</span> <span>Riyadh - old Industrial - ali st.</span></div></div>
  </div></body></html>`;
};

// const createReport = (report: any) => {
//     return `Hello ${report.name},
//     Your single use code is: ${report.otp}
//     This code is valid for 3 minutes.
//     `
// }

export const whatsAppTemplate = {
     createAccount,
     forgetPassword,
     createInvoice,
     createReport,
     getRecieveCar,
     // resetPassword,
     // resetPasswordByUrl,
     // contactFormTemplate,
     // contact,
};
