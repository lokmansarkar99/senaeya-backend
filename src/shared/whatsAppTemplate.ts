import { CLIENT_STATUS } from '../app/modules/client/client.enum';
import { IInvoice, TranslatedFieldEnum } from '../app/modules/invoice/invoice.interface';
import { IworkShop } from '../app/modules/workShop/workShop.interface';
import { buildTranslatedField } from '../utils/buildTranslatedField';

const createAccount = (values: { name?: string; otp: number; contact: string }) => {
     return `OTP code: ${values.otp}   We are happy to serve you in Senaeya app.
     رمز تفعيل رقم الجوال: ${values.otp} نسعد بخدمتكم في تطبيق الصناعية.
     `;
};

const forgetPassword = (values: { name: string; password: string; contact: string }) => {
     return `New password: ${values.password}   Use the password to log in to your account. You can change your password from your profile page.
كلمة المرور الجديدة: ${values.password} استخدم كلمة المرور للدخول إلى حسابك ، بإمكانك تعديل كلمة المرور من صفحة الملف الشخصي.
 `;
};

const getRecieveCar = (values: { contact: string; workshopNameEnglish: string; workshopNameArabic: string }) => {
     return `Your car is ready for collection at ${values.workshopNameEnglish}
     سيارتك جاهزة للاستلام في ${values.workshopNameArabic}.`;
};

const createInvoice = async (updatedInvoice: IInvoice, lang: TranslatedFieldEnum) => {
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
                                 <td>${part.item}</td>
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

const createReport = (
     report: {
          numberOfPaidInvoices: number;
          numberOfUnpaidPostpaidInvoices: number;
          numberOfUnpaidNonPostpaidInvoices: number;
          totalAllIncomeRecorded: number;
          totalIncomeCollected: number;
          totalUnpaidPostpaidFinalCost: number;
          totalExpenses: number;
          collectedFinancialBalance: number | undefined;
          recordedFinancialBalance: number | undefined;
          numberOfCars: number;
          range: { start: Date; end: Date };
          scopedByProviderWorkShopId: boolean;
          workshop: IworkShop;
     },
     lang: 'ar' | 'en',
) => {
     const savedInvoicesCount = report?.numberOfUnpaidNonPostpaidInvoices ?? 0;
     const postpaidInvoicesCount = report?.numberOfUnpaidPostpaidInvoices ?? 0;
     const completedInvoicesCount = report?.numberOfPaidInvoices ?? 0;

     const collectedIncome = Number(report?.totalIncomeCollected ?? 0);
     const recordedIncome = Number(report?.totalAllIncomeRecorded ?? 0);
     const postpaidSaved = Math.max(0, recordedIncome - collectedIncome);
     const expenses = Number(report?.totalExpenses ?? 0);

     const balCollected = Number(report?.collectedFinancialBalance ?? collectedIncome - expenses);
     const balRecorded = Number(report?.recordedFinancialBalance ?? recordedIncome - expenses);

     const cars = report?.numberOfCars ?? 0;

     const s = report?.range?.start ? new Date(report.range.start) : null;
     const e = report?.range?.end ? new Date(report.range.end) : null;
     const fmtDate = (x: Date) => `${String(x.getDate()).padStart(2, '0')}-${String(x.getMonth() + 1).padStart(2, '0')}-${x.getFullYear()}`;
     const dur = s && e ? Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1) : undefined;
     const dateRange =
          s && e ? (lang === 'ar' ? `من ${fmtDate(s)} إلى ${fmtDate(e)}${dur ? ` مدة: ${dur} أيام` : ''}` : `From ${fmtDate(s)} to ${fmtDate(e)}${dur ? ` Duration: ${dur} days` : ''}`) : '';

     const fmt = (n: number) =>
          n.toLocaleString(undefined, {
               minimumFractionDigits: 2,
               maximumFractionDigits: 2,
          });

     return `<html>
  <head>
    <meta charset="utf-8" />
    <title>pdf-report.svg</title>
  </head>
  <body>
    <svg xmlns="http://www.w3.org/2000/svg" width="595" height="842">
      <defs>
        <clipPath id="a"><path d="M0 0h595v842H0z"></path></clipPath>
      </defs>
      <g clip-path="url(#a)">
        <path fill="#fff" d="M0 0h595v842H0z"></path>
        <text
          fill="#1771b7"
          data-name="Report issued by Senaeya App"
          font-family="Calibri-Bold, Calibri"
          font-size="22"
          font-weight="700"
          transform="translate(160 131)"
        >
          <tspan x="0" y="0">${lang === 'ar' ? 'تم إصدار التقرير بواسطة تطبيق Senaeya' : 'Report issued by Senaeya App'}</tspan>
        </text>
        <rect
          width="151"
          height="91"
          fill="#f4f5f7"
          rx="20"
          transform="translate(394 220)"
        ></rect>
        <rect
          width="237"
          height="120"
          fill="#f4f5f7"
          data-name="card1bg"
          rx="20"
          transform="translate(308 547)"
        ></rect>
        <rect
          width="237"
          height="120"
          fill="#f4f5f7"
          data-name="card1bg"
          rx="20"
          transform="translate(50 547)"
        ></rect>
        <rect
          width="151"
          height="91"
          fill="#f4f5f7"
          data-name="card1bg"
          rx="20"
          transform="translate(222 220)"
        ></rect>
        <rect
          width="151"
          height="91"
          fill="#f4f5f7"
          data-name="card1bg"
          rx="20"
          transform="translate(50 220)"
        ></rect>
        <text
          fill="#11c84e"
          data-name="Number of completed invoices"
          font-family="Calibri-Bold, Calibri"
          font-size="16"
          font-weight="700"
          transform="translate(470 241)"
        >
          <tspan x="-35.875" y="0">${lang === 'ar' ? 'عدد' : 'Number of'}</tspan>
          <tspan x="-63.84" y="20">${lang === 'ar' ? 'السندات المدفوعة' : 'completed invoices'}</tspan>
        </text>
        <text
          fill="#f90"
          data-name="Number of Postpaid invoices"
          font-family="Calibri-Bold, Calibri"
          font-size="16"
          font-weight="700"
          transform="translate(298 241)"
        >
          <tspan x="-35.875" y="0">${lang === 'ar' ? 'عدد' : 'Number of'}</tspan>
          <tspan x="-57.301" y="20">${lang === 'ar' ? 'السندات المدفوعة' : 'Postpaid invoices'}</tspan>
        </text>
        <text
          fill="#cb3c40"
          data-name="Number of saved invoices"
          font-family="Calibri-Bold, Calibri"
          font-size="16"
          font-weight="700"
          transform="translate(126 241)"
        >
          <tspan x="-35.875" y="0">${lang === 'ar' ? 'عدد' : 'Number of'}</tspan>
          <tspan x="-47.555" y="20">${lang === 'ar' ? 'السندات المحفوظة' : 'saved invoices'}</tspan>
        </text>
        <text
          fill="#11c84e"
          data-name=${completedInvoicesCount}
          font-family="Calibri-Bold, Calibri"
          font-size="30"
          font-weight="700"
          transform="translate(470 297)"
        >
          <tspan x="-15.205" y="0">${completedInvoicesCount}</tspan>
        </text>
        <text
          fill="#f90"
          data-name=${postpaidInvoicesCount}
          font-family="Calibri-Bold, Calibri"
          font-size="30"
          font-weight="700"
          transform="translate(298 297)"
        >
          <tspan x="-7.603" y="0">${postpaidInvoicesCount}</tspan>
        </text>
        <text
          fill="#cb3c40"
          data-name=${savedInvoicesCount}
          font-family="Calibri-Bold, Calibri"
          font-size="30"
          font-weight="700"
          transform="translate(126 297)"
        >
          <tspan x="-7.603" y="0">${savedInvoicesCount}</tspan>
        </text>
        <rect
          width="495"
          height="48"
          fill="#1771b7"
          data-name="Rectangle 5386"
          rx="3"
          transform="translate(50 333)"
        ></rect>
        <rect
          width="495"
          height="48"
          fill="#cb3c40"
          data-name="Rectangle 5387"
          rx="3"
          transform="translate(50 396)"
        ></rect>
        <rect
          width="495"
          height="48"
          fill="#959595"
          data-name="Rectangle 5388"
          rx="3"
          transform="translate(50 459)"
        ></rect>
        <rect
          width="495"
          height="35"
          fill="#959595"
          data-name="Rectangle 5392"
          opacity=".5"
          rx="3"
          transform="translate(50 163)"
        ></rect>
        <rect
          width="495"
          height="35"
          fill="#959595"
          data-name="Rectangle 5389"
          opacity=".5"
          rx="3"
          transform="translate(50 707)"
        ></rect>
        <text
          data-name=${dateRange}
          font-family="Calibri-Bold, Calibri"
          font-size="20"
          font-weight="700"
          transform="translate(297.5 186)"
          text-anchor="middle"
        >
          <tspan xml:space="preserve" x="0" y="0">
            ${dateRange}
          </tspan>
        </text>
        <text
          fill="#fff"
          data-name="Total income collected"
          font-family="Calibri-Bold, Calibri"
          font-size="25"
          font-weight="700"
          transform="translate(410 366)"
        >
          <tspan x="-115.796" y="0">${lang === 'ar' ? 'إجمالي الدخل الذي تم جمعه' : 'Total income collected'}</tspan>
        </text>
        <text
          fill="#fff"
          data-name="Total postpaid and saved income"
          font-family="Calibri-Bold, Calibri"
          font-size="22"
          font-weight="700"
          transform="translate(381 428)"
        >
          <tspan x="-149.021" y="0">${lang === 'ar' ? 'إجمالي الدخل المدفوع والمدخر' : 'Total postpaid and saved income'}</tspan>
        </text>
        <text
          fill="#fff"
          data-name="Total expenses paid"
          font-family="Calibri-Bold, Calibri"
          font-size="25"
          font-weight="700"
          transform="translate(429 490)"
        >
          <tspan x="-101.404" y="0">${lang === 'ar' ? 'إجمالي النفقات المدفوعة' : 'Total expenses paid'}</tspan>
        </text>
        <text
          data-name="Number of cars serviced"
          font-family="Calibri-Bold, Calibri"
          font-size="22"
          font-weight="700"
          transform="translate(420 732)"
        >
          <tspan x="-110.317" y="0">${lang === 'ar' ? 'عدد السيارات المدفوعة' : 'Number of cars serviced'}</tspan>
        </text>
        <text
          font-family="Calibri-Bold, Calibri"
          font-size="22"
          font-weight="700"
          transform="translate(96 732)"
        >
          <tspan x="-19.417" y="0">${lang === 'ar' ? 'سيارات' : 'Cars'}</tspan>
        </text>
        <g fill="#fff">
          <path
            d="M80.947 368.246a10.1 10.1 0 0 0-.844 3.15l9.326-1.982a10.1 10.1 0 0 0 .844-3.15Z"
            data-name="Path 28007"
          ></path>
          <path
            d="M89.434 363.203a11 11 0 0 0 .839-3.3l-7.224 1.617v-3.107l6.385-1.428a11 11 0 0 0 .839-3.3l-7.224 1.618v-11.179a10.3 10.3 0 0 0-2.889 2.552v9.275l-2.889.646v-13.994a10.3 10.3 0 0 0-2.89 2.552v12.088l-6.465 1.446a11 11 0 0 0-.839 3.3l7.3-1.634v3.915l-7.824 1.748a11 11 0 0 0-.839 3.3l8.194-1.833a2.6 2.6 0 0 0 1.616-1.135l1.5-2.347a1.57 1.57 0 0 0 .247-.85v-3.45l2.889-.646v6.218z"
            data-name="Path 28008"
          ></path>
        </g>
        <g fill="#fff" data-name="Saudi_Riyal_Symbol">
          <path
            d="M80.947 431.246a10.1 10.1 0 0 0-.844 3.15l9.326-1.982a10.1 10.1 0 0 0 .844-3.15Z"
            data-name="Path 28007"
          ></path>
          <path
            d="M89.434 426.203a11 11 0 0 0 .839-3.3l-7.224 1.617v-3.107l6.385-1.428a11 11 0 0 0 .839-3.3l-7.224 1.618v-11.179a10.3 10.3 0 0 0-2.889 2.552v9.275l-2.889.646v-13.994a10.3 10.3 0 0 0-2.89 2.552v12.088l-6.465 1.446a11 11 0 0 0-.839 3.3l7.3-1.634v3.915l-7.824 1.748a11 11 0 0 0-.839 3.3l8.194-1.833a2.6 2.6 0 0 0 1.616-1.135l1.5-2.347a1.57 1.57 0 0 0 .247-.85v-3.45l2.889-.646v6.218z"
            data-name="Path 28008"
          ></path>
        </g>
        <g fill="#cb3c40" data-name="Saudi_Riyal_Symbol">
          <path
            d="M383.83 653.184a8.7 8.7 0 0 0-.726 2.712l8.031-1.707a8.7 8.7 0 0 0 .727-2.712Z"
            data-name="Path 28007"
          ></path>
          <path
            d="M391.139 648.84a9.5 9.5 0 0 0 .722-2.839l-6.221 1.393v-2.677l5.5-1.23a9.5 9.5 0 0 0 .722-2.839l-6.221 1.391v-9.627a8.9 8.9 0 0 0-2.488 2.2v7.987l-2.488.557v-12.053a8.9 8.9 0 0 0-2.488 2.2v10.407l-5.567 1.245a9.5 9.5 0 0 0-.723 2.839l6.289-1.407v3.371l-6.74 1.507a9.5 9.5 0 0 0-.722 2.838l7.055-1.578a2.24 2.24 0 0 0 1.389-.975l1.294-2.019a1.35 1.35 0 0 0 .213-.732v-2.97l2.488-.557v5.354l7.986-1.788Z"
            data-name="Path 28008"
          ></path>
        </g>
        <g fill="#1771b7" data-name="Saudi_Riyal_Symbol">
          <path
            d="M126.473 653.184a8.7 8.7 0 0 0-.726 2.712l8.031-1.707a8.7 8.7 0 0 0 .727-2.712Z"
            data-name="Path 28007"
          ></path>
          <path
            d="M133.782 648.84a9.5 9.5 0 0 0 .722-2.839l-6.221 1.393v-2.677l5.5-1.23a9.5 9.5 0 0 0 .722-2.839l-6.221 1.391v-9.627a8.9 8.9 0 0 0-2.488 2.2v7.987l-2.488.557v-12.053a8.9 8.9 0 0 0-2.488 2.2v10.407l-5.567 1.245a9.5 9.5 0 0 0-.723 2.839l6.289-1.407v3.371l-6.74 1.507a9.5 9.5 0 0 0-.722 2.838l7.055-1.578a2.24 2.24 0 0 0 1.389-.975l1.294-2.019a1.35 1.35 0 0 0 .213-.732v-2.97l2.488-.557v5.354l7.986-1.788Z"
            data-name="Path 28008"
          ></path>
        </g>
        <g fill="#fff" data-name="Saudi_Riyal_Symbol">
          <path
            d="M80.947 494.246a10.1 10.1 0 0 0-.844 3.15l9.326-1.982a10.1 10.1 0 0 0 .844-3.15Z"
            data-name="Path 28007"
          ></path>
          <path
            d="M89.434 489.203a11 11 0 0 0 .839-3.3l-7.224 1.617v-3.107l6.385-1.428a11 11 0 0 0 .839-3.3l-7.224 1.618v-11.179a10.3 10.3 0 0 0-2.889 2.552v9.275l-2.889.646v-13.994a10.3 10.3 0 0 0-2.89 2.552v12.088l-6.465 1.446a11 11 0 0 0-.839 3.3l7.3-1.634v3.915l-7.824 1.748a11 11 0 0 0-.839 3.3l8.194-1.833a2.6 2.6 0 0 0 1.616-1.135l1.5-2.347a1.57 1.57 0 0 0 .247-.85v-3.45l2.889-.646v6.218z"
            data-name="Path 28008"
          ></path>
        </g>
        <text
          fill="#fff"
          data-name=${fmt(collectedIncome)}
          font-family="Calibri-Bold, Calibri"
          font-size="25"
          font-weight="700"
          transform="translate(146 366)"
        >
          <tspan x="-41.351" y="0">${fmt(collectedIncome)}</tspan>
        </text>
        <text
          fill="#fff"
          data-name=${fmt(postpaidSaved)}
          font-family="Calibri-Bold, Calibri"
          font-size="25"
          font-weight="700"
          transform="translate(146 429)"
        >
          <tspan x="-41.351" y="0">${fmt(postpaidSaved)}</tspan>
        </text>
        <text
          fill="#fff"
          data-name=${fmt(expenses)}
          font-family="Calibri-Bold, Calibri"
          font-size="25"
          font-weight="700"
          transform="translate(146 492)"
        >
          <tspan x="-35.016" y="0">${fmt(expenses)}</tspan>
        </text>
        <text
          data-name=${cars}
          font-family="Calibri-Bold, Calibri"
          font-size="22"
          font-weight="700"
          transform="translate(146 733)"
        >
          <tspan x="-11.15" y="0">${cars}</tspan>
        </text>
        <text
          fill="#cb3c40"
          data-name="Recorded financial balance"
          font-family="Calibri-Bold, Calibri"
          font-size="20"
          font-weight="700"
          transform="translate(427 577)"
        >
          <tspan x="-111.274" y="0">${lang === 'ar' ? 'الرصيد المحفوظ' : 'Recorded financial balance'}</tspan>
        </text>
        <text
          fill="#cb3c40"
          data-name=${fmt(balRecorded)}
          font-family="Calibri-Bold, Calibri"
          font-size="25"
          font-weight="700"
          transform="translate(441 652)"
        >
          <tspan x="-41.351" y="0">${fmt(balRecorded)}</tspan>
        </text>
        <text
          fill="#1771b7"
          data-name=${fmt(balCollected)}
          font-family="Calibri-Bold, Calibri"
          font-size="25"
          font-weight="700"
          transform="translate(183.643 652)"
        >
          <tspan x="-41.351" y="0">${fmt(balCollected)}</tspan>
        </text>
        <text
          fill="#1771b7"
          data-name="Collected financial balance"
          font-family="Calibri-Bold, Calibri"
          font-size="20"
          font-weight="700"
          transform="translate(168 577)"
        >
          <tspan x="-110.591" y="0">${lang === 'ar' ? 'الرصيد المدفوع' : 'Collected financial balance'}</tspan>
        </text>
        <text
          data-name="All income recorded"
          font-family="Calibri-Bold, Calibri"
          font-size="11"
          font-weight="700"
          transform="translate(429 596)"
        >
          <tspan x="-45.751" y="0">${lang === 'ar' ? 'إجمالي الإيرادات المدفوعة' : 'All income recorded'}</tspan>
        </text>
        <text
          data-name="All income collected"
          font-family="Calibri-Bold, Calibri"
          font-size="11"
          font-weight="700"
          transform="translate(169 596)"
        >
          <tspan x="-45.861" y="0">${lang === 'ar' ? 'إجمالي الإيرادات المدفوعة' : 'All income collected'}</tspan>
        </text>
        <text
          data-name="All expenses paid"
          font-family="Calibri-Bold, Calibri"
          font-size="11"
          font-weight="700"
          transform="translate(430 617)"
        >
          <tspan x="-39.529" y="0">${lang === 'ar' ? 'إجمالي النفقات المدفوعة' : 'All expenses paid'}</tspan>
        </text>
        <text
          data-name="All expenses paid"
          font-family="Calibri-Bold, Calibri"
          font-size="11"
          font-weight="700"
          transform="translate(169 617)"
        >
          <tspan x="-39.529" y="0">${lang === 'ar' ? 'إجمالي النفقات المدفوعة' : 'All expenses paid'}</tspan>
        </text>
        <text
          data-name="-"
          font-family="Calibri-Bold, Calibri"
          font-size="20"
          font-weight="700"
          transform="translate(430 609)"
        >
          <tspan x="-3.062" y="0">-</tspan>
        </text>
        <text
          data-name="-"
          font-family="Calibri-Bold, Calibri"
          font-size="20"
          font-weight="700"
          transform="translate(166 609)"
        >
          <tspan x="-3.062" y="0">-</tspan>
        </text>
        <path
          fill="#1771b7"
          d="M0 0h595v77H0z"
          data-name="Rectangle 5390"
        ></path>
        <path
          fill="#cb3c40"
          d="M0 76h595v15H0z"
          data-name="Rectangle 5391"
        ></path>
        <text
          fill="#fff"
          data-name=${report.workshop.workshopNameArabic}
          font-family="Arial-BoldMT, Arial"
          font-size="20"
          font-weight="700"
          transform="translate(205 41)"
        >
          <tspan x="0" y="0">${report.workshop.workshopNameArabic}</tspan>
        </text>
        <text
          fill="#fff"
          data-name=${report.workshop.workshopNameEnglish}
          font-family="ArialMT, Arial"
          font-size="15"
          transform="translate(233 69)"
        >
          <tspan x="0" y="0">${report.workshop.workshopNameEnglish}</tspan>
        </text>
        <text
          fill="#fff"
          data-name=${report.workshop.crn}
          font-family="ArialMT, Arial"
          font-size="10"
          transform="translate(447 87)"
        >
          <tspan x="0" y="0">CR - ${report.workshop.crn}</tspan>
        </text>
        <text
          fill="#fff"
          data-name=${report.workshop.taxVatNumber}
          font-family="ArialMT, Arial"
          font-size="10"
          transform="translate(50 87)"
        >
          <tspan x="0" y="0">VAT - ${report.workshop.taxVatNumber}</tspan>
        </text>
        <path
          fill="#cb3c40"
          d="M207 815h389v22H207z"
          data-name="Rectangle 5394"
        ></path>
        <path
          fill="#1771b7"
          d="M0 796h207v41H0z"
          data-name="Rectangle 5393"
        ></path>
        <path
          fill="#1771b7"
          d="m207 796 33.5 41h-67Z"
          data-name="Polygon 2"
        ></path>
        <text
          fill="#fff"
          data-name=${report.workshop.address}
          font-family="Calibri-Bold, Calibri"
          font-size="12"
          font-weight="700"
          transform="translate(488 830)"
        >
          <tspan x="-72.36" y="0">${report.workshop.address}</tspan>
        </text>
        <text
          fill="#fff"
          data-name=${report.workshop.contact}
          font-family="Calibri-Bold, Calibri"
          font-size="12"
          font-weight="700"
          letter-spacing=".07em"
          transform="translate(279 830)"
        >
          <tspan x="-41.096" y="0">${report.workshop.contact}</tspan>
        </text>
        <g data-name="Group 55921">
          <path
            fill="#fff"
            d="m352.708 826.662 1.637-1.637a.47.47 0 0 0 .082-.555l-1.053-1.962a.47.47 0 0 1 .01-.462l1.7-2.863a.47.47 0 0 1 .592-.191c.557.245 1.577.69 2.028.867a.6.6 0 0 1 .249.17c1.654 1.908-.361 5.7-3.267 8.609s-6.702 4.92-8.61 3.262a.6.6 0 0 1-.17-.244 78 78 0 0 0-.867-2.028.47.47 0 0 1 .191-.592l2.863-1.7a.47.47 0 0 1 .462-.01l1.962 1.055a.47.47 0 0 0 .555-.082Z"
            data-name="Path 28011"
          ></path>
          <path
            fill="#fff"
            d="M352.451 818.953v1.356a6.1 6.1 0 0 0-6.1 6.1H345a7.46 7.46 0 0 1 7.451-7.456"
            data-name="Path 28012"
          ></path>
          <path
            fill="#fff"
            d="M352.451 821.587v1.355a3.466 3.466 0 0 0-3.462 3.467h-1.355a4.82 4.82 0 0 1 4.817-4.822"
            data-name="Path 28013"
          ></path>
          <circle
            cx="6.608"
            cy="6.608"
            r="6.608"
            fill="#2ab540"
            data-name="Ellipse 3"
            transform="translate(328.858 819.285)"
          ></circle>
          <path
            fill="#fff"
            d="M331.227 825.854a4.25 4.25 0 0 0 .568 2.127l-.6 2.2 2.256-.592a4.25 4.25 0 0 0 2.034.518 4.256 4.256 0 1 0-4.258-4.253m1.344 2.016-.084-.134a3.537 3.537 0 1 1 3 1.657 3.54 3.54 0 0 1-1.8-.493l-.129-.077-1.339.351Zm2.912 2.242"
            data-name="Path 28009"
          ></path>
          <path
            fill="#fff"
            d="M334.42 824.079c-.08-.177-.163-.181-.239-.184s-.133 0-.2 0a.4.4 0 0 0-.284.133 1.2 1.2 0 0 0-.372.887 2.07 2.07 0 0 0 .434 1.1 4.37 4.37 0 0 0 1.816 1.605c.9.354 1.081.284 1.276.266a1.07 1.07 0 0 0 .718-.505.9.9 0 0 0 .062-.506c-.027-.044-.1-.071-.2-.124s-.629-.31-.727-.346-.168-.053-.239.053-.275.346-.337.417-.124.08-.23.027a2.9 2.9 0 0 1-.855-.528 3.2 3.2 0 0 1-.592-.736c-.062-.106-.007-.164.047-.217s.106-.124.16-.186a.7.7 0 0 0 .106-.177.2.2 0 0 0-.009-.186c-.027-.053-.233-.579-.328-.789"
            data-name="Path 28010"
          ></path>
        </g>
        <path fill="none" d="M412.082 793.031h24.6v24.6h-24.6Z"></path>
        <text
          fill="#fff"
          data-name="You can issue multiple reports via Senaeya App Daily - Weekly - Monthly - Annual Report - and more"
          font-family="Calibri"
          font-size="11"
          transform="translate(110 815)"
        >
          <tspan x="-104.411" y="0">
            ${lang === 'ar' ? ' يمكنك إصدار تقارير متعددة عبر تطبيق سينايا' : 'You can issue multiple reports via Senaeya App'}
          </tspan>
          <tspan font-size="10">
            <tspan x="-106.143" y="15">
              ${lang === 'ar' ? 'تقرير يومي - أسبوعي - شهري - سنوي - و المزيد' : 'Daily - Weekly - Monthly - Annual Report - and more'}
            </tspan>
          </tspan>
        </text>
      </g>
    </svg>
  </body>
</html>
`;
};

const defaulterList = ({ status }: { status: string }) => {
     const message =
          status === CLIENT_STATUS.BLOCK
               ? `Sorry... your name has been added to the defaulters list.
    عذرا … لقد تم وضع اسمكم في قائمة المتعثرين عن السداد.`
               : `Your name has been removed from the defaulters list.
    إزالة اسمكم من قائمة المتعثرين عن السداد.
`;
     return message;
};

const subscriptionExtended = (values: { daysCount: number }) => {
     return `Your subscription to Senaeya app has been extended for ${values.daysCount} days.
    تم تمديد اشتراككم في تطبيق الصناعية لمدة ${values.daysCount} يوم.
    `;
};

const scheduleInvoiceWarningMessage = ({ workshopNameEnglish, workshopNameArabic }: { workshopNameEnglish: string; workshopNameArabic: string }) => {
     return `You have an overdue invoice for ${workshopNameEnglish}. Please pay the invoice within 3 days, so that your name is not placed on the defaulters list.
لديك فاتورة متأخرة السداد في ${workshopNameArabic} ، نرجو منكم سداد الفاتورة خلال 3 أيام ، حتى لا يتم وضع اسمكم في قائمة المتعثرين عن السداد.
     `;
};

const subscriptionDeleted = () => {
     return `Your subscription to Senaeya app has been deleted.
    تم حذف اشتراككم في تطبيق الصناعية.
    `;
};

export const whatsAppTemplate = {
     createAccount,
     forgetPassword,
     createInvoice,
     createReport,
     getRecieveCar,
     defaulterList,
     subscriptionExtended,
     scheduleInvoiceWarningMessage,
     subscriptionDeleted
     // resetPassword,
     // resetPasswordByUrl,
     // contactFormTemplate,
     // contact,
};
