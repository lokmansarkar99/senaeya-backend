import { ICar } from '../app/modules/car/car.interface';
import { IcarBrand } from '../app/modules/carBrand/carBrand.interface';
import { IcarModel } from '../app/modules/carModel/carModel.interface';
import { CLIENT_CAR_TYPE, CLIENT_STATUS } from '../app/modules/client/client.enum';
import { IClient } from '../app/modules/client/client.interface';
import { ICoupon } from '../app/modules/coupon/coupon.interface';
import { ImageType } from '../app/modules/image/image.enum';
import { Image } from '../app/modules/image/image.model';
import { imageService } from '../app/modules/image/image.service';
import { IInvoice, IInvoiceSpareParts, IInvoiceWork, TranslatedFieldEnum } from '../app/modules/invoice/invoice.interface';
import { PackageDuration } from '../app/modules/package/package.enum';
import { IPackage } from '../app/modules/package/package.interface';
import { PaymentMethod } from '../app/modules/payment/payment.enum';
import { ISpareParts } from '../app/modules/spareParts/spareParts.interface';
import { ISubscription } from '../app/modules/subscription/subscription.interface';
import { IUser } from '../app/modules/user/user.interface';
import { Iwork } from '../app/modules/work/work.interface';
import { IworkShop } from '../app/modules/workShop/workShop.interface';
import config from '../config';
import { buildTranslatedField } from '../utils/buildTranslatedField';

const createInvoice = async (
     mockData: IInvoice & {
          client: IClient & { clientId: IUser };
          worksList: IInvoiceWork[];
          providerWorkShopId: IworkShop & { ownerId: IUser };
          sparePartsList: IInvoiceSpareParts[];
          car: ICar & {
               brand: IcarBrand;
               model: IcarModel;
               plateNumberForSaudi: {
                    symbol: {
                         image: string;
                    };
                    numberEnglish: string;
                    numberArabic: string;
                    alphabetsCombinations: string[];
               };
          };
     },
     lang: TranslatedFieldEnum,
) => {
     const date = new Date(mockData.createdAt);

     // 💡 Base URL (mock — adjust as needed)
     const base_route = config.backend_url || 'http://10.10.7.103:7010';

     function pad(num: number | any) {
          return num.toString().padStart(2, '0');
     }

     const invoiceCreatedAtt = `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;

     const carBrandImage = `${base_route}${mockData.car.brand.image}`;
     const providerWorkShopImage = `${base_route}${mockData.providerWorkShopId.image}`;
     const carSymbol = mockData.car.carType === CLIENT_CAR_TYPE.SAUDI ? `${base_route}${mockData.car.plateNumberForSaudi.symbol.image}` : '';
     const invoiceQrLink = `${base_route}${mockData.invoiceQRLink}`;

     const interNationalCarNumberComponent =
          mockData.car.carType === CLIENT_CAR_TYPE.INTERNATIONAL
               ? `<div class="invoice-number-box">
              <div class="invoice-number">${mockData.car.plateNumberForInternational}</div>
            </div>`
               : `<div></div>`;

     const result = `
${
     mockData.car.carType !== CLIENT_CAR_TYPE.INTERNATIONAL
          ? `
    <div class="top-plate">${mockData._id}</div>
  `
          : `
    <div class="bottom-plate">
      <div class="left-col">
        <div class="section arabic">${mockData.car.plateNumberForSaudi.numberArabic}</div>
        <div class="section">${mockData.car.plateNumberForSaudi.numberEnglish}</div>
      </div>

      <div class="left-col">
        <div class="section arabic">${mockData.car.plateNumberForSaudi.alphabetsCombinations[1]}</div>
        <div class="section">${mockData.car.plateNumberForSaudi.alphabetsCombinations[0]}</div>
      </div>

      <div class="right-strip">
        <img src="https://api.senaeya.net/image/${mockData.car.plateNumberForSaudi.symbol.image}" alt="" />
      </div>
    </div>
  `
}
`;

     const saudiCarPlateComponent =
          mockData.car.carType === CLIENT_CAR_TYPE.SAUDI
               ? `<div class="stamps-box">
              <div class="stamp-row">
                <span class="stamp-label">${mockData.car.plateNumberForSaudi.alphabetsCombinations[0]}</span>
                <span class="stamp-value">${mockData.car.plateNumberForSaudi.numberArabic}</span>
              </div>
              <div class="stamp-row">
                <span class="stamp-label">${mockData.car.plateNumberForSaudi.alphabetsCombinations[1]}</span>
                <span class="stamp-value">${mockData.car.plateNumberForSaudi.numberEnglish}</span>
              </div>
              <div class="logo-section">
                <img src="${carSymbol}" class="logo" alt="Symbol">
              </div>
            </div>`
               : `<div></div>`;

     const worksTableComponent = `
        <div class="table-header">
          <div>N</div>
          <div>الرمز<br />Code</div>
          <div>الأعمــــال Works</div>
          <div>عدد<br />Qt.</div>
          <div>السعر<br />Price</div>
          <div>الإجمالي<br />Total</div>
        </div>
        <div class="table-body">
          ${
               mockData.worksList.length > 0
                    ? mockData.worksList
                           .map(
                                (item, index) => `
                    <div class="table-row">
                      <div>${index + 1}</div>
                      <div>${(item.work as any).code}</div>
                      <div>${(item.work as any).title[lang]}</div>
                      <div>${item.quantity}</div>
                      <div>${item.cost}</div>
                      <div>${item.finalCost}</div>
                    </div>
                  `,
                           )
                           .join('')
                    : `<div class="table-row"><div>1</div><div></div><div></div><div></div><div></div><div></div></div>`
          }
        </div>`;

     const sparePartsTableComponent = `
        <div class="spare-parts-header">
          <div>N</div>
          <div>الرمز<br />Code</div>
          <div>قطع غيار Spare Parts</div>
          <div>عدد<br />Qt.</div>
          <div>السعر<br />Price</div>
          <div>الإجمالي<br />Total</div>
        </div>
        <div class="spare-parts-body">
          ${
               mockData.sparePartsList.length > 0
                    ? mockData.sparePartsList
                           .map(
                                (item, index) => `
                    <div class="spare-row">
                      <div>${index + 1}</div>
                      <div>${item.code}</div>
                      <div>${item.itemName}</div>
                      <div>${item.quantity}</div>
                      <div>${item.cost}</div>
                      <div>${item.finalCost}</div>
                    </div>
                  `,
                           )
                           .join('')
                    : `<div class="spare-row"><div>1</div><div></div><div></div><div></div><div></div><div></div></div>`
          }
        </div>`;

     return `
      <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>فاتورة ضريبية مبسطة</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', 'Segoe UI', Tahoma, sans-serif;
      background-color: #f5f5f5;
      padding: 20px;
    }

    .invoice-container {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    /* Header Section */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px;
      border-bottom: 1px solid gray;
    }

    .logo-section {
      width: 100px;
    }

    .logo {
      width: 80px;
      height: 80px;
      object-fit: contain;
    }

    .qr-section {
      width: 30px;
      text-align: center;
    }

    .qr-code {
      width: 80px;
      height: 80px;
      object-fit: contain;
    }

    .company-info {
      text-align: right;
      flex: 1;
      padding: 0 20px;
    }

    .company-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .company-subtitle {
      font-size: 12px;
      margin-bottom: 10px;
    }

    .company-details {
      font-size: 11px;
      line-height: 1.6;
    }

    /* Invoice Info Section */
    .invoice-info {
      display: flex;
      justify-content: space-between;
      padding: 15px 20px;
      background: #ffff;
      border-bottom: 1px solid #ddd;
    }

    .invoice-left {
      display: flex;
      gap: 40px;
    }

    .invoice-field {
      font-size: 11px;
    }

    .invoice-label {
      color: #666;
      margin-bottom: 3px;
    }

    .invoice-value {
      color: #d32f2f;
      font-weight: bold;
    }

    .invoice-type {
      text-align: center;
    }

    .invoice-type-label {
      font-size: 10px;
      color: #666;
      margin-bottom: 3px;
    }

    .invoice-type-title {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .payment-method {
      font-size: 12px;
      color: #d32f2f;
      font-weight: bold;
    }

    .invoice-number-box {
      border: 1px solid gray;
      padding: 5px 15px;
    }

    .invoice-number {
      font-size: 16px;
      font-weight: bold;
      text-align: center;
    }

    /* Vehicle Info Section */
    .vehicle-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      /* border-bottom: 1px solid gray; */
    }

    .vehicle-brand {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .vehicle-model,
    .vehicle-year {
      font-size: 20px;
      font-weight: bold;
    }

    .tax-info,
    .customer-label {
      font-size: 11px;
      color: #666;
    }

    .mobile-number {
      font-size: 13px;
      direction: ltr;
    }

    .stamps-box {
      border: 2px solid #000;
      padding: 8px 12px;
    }

    .stamp-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      margin-bottom: 3px;
      font-size: 11px;
    }

    .stamp-label {
      font-weight: bold;
    }

    .stamp-value {
      direction: ltr;
      font-weight: bold;
    }

    /* Tables */
    .table-header,
    .spare-parts-header {
      background: #1976d2;
      color: white;
      display: grid;
      grid-template-columns: 40px 100px 1fr 60px 100px 100px;
      font-weight: bold;
      font-size: 12px;
      text-align: center;
    }

    .table-header div,
    .spare-parts-header div {
      padding: 12px 5px;
      border-left: 1px solid #fff;
    }

    .table-header div:first-child,
    .spare-parts-header div:first-child {
      border-left: none;
    }

    .table-body,
    .spare-parts-body {
      min-height: 150px;
      background: #f5f5f5;
    }

    .table-row,
    .spare-row {
      display: grid;
      grid-template-columns: 40px 100px 1fr 60px 100px 100px;
      border-bottom: 1px solid #ddd;
      text-align: center;
      font-size: 11px;
    }

    .table-row div,
    .spare-row div {
      padding: 10px 5px;
      border-left: 1px solid #ddd;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .table-row div:first-child,
    .spare-row div:first-child {
      border-left: none;
    }

    /* Bottom Section */
    .bottom-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-top: 2px solid rgb(233, 233, 233);
    }

    .terms-section {
      padding: 20px;
      border-left: 1px solid #ddd;
      background: #fff;
    }

    .terms-title {
      font-weight: bold;
      margin-bottom: 12px;
      font-size: 13px;
      text-align: center;
    }

    .terms-content {
      text-align: justify;
      font-size: 13px;
      line-height: 1.8;
      color: #000;
    }

    .manager-section {
      display: flex;
      justify-content: center;
      gap: 4px;
      margin-top: 20px;
      text-align: center;
      font-weight: bold;
      font-size: 12px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
    }

    .summary-section {
      display: flex;
      flex-direction: column;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      border-bottom: 1px solid #ddd;
      font-size: 13px;
      background: #f9f9f9;
    }

    .summary-row.red {
      background: #c93434;
      color: white;
    }

    .summary-row.gray {
      background: #e8e8e8;
    }

    .summary-row.blue {
      background: #1976d2;
      color: white;
      font-weight: bold;
      font-size: 14px;
      border-bottom: none;
    }

    .summary-label {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .summary-icon {
      display: block;
      align-items: center;
      font-size: 24px;
      font-weight: bold;

    }

    .summary-content {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      width: 310px;
    }

    /* Footer Banner */
    .banner {
      display: flex;
      width: 100%;
      position: relative;
      overflow: hidden;
    }

    .left-section {
      background: #1e5a96;
      width: 35%;
      padding: 12px 10px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      clip-path: polygon(0 0, 75% 0, 100% 100%, 0 100%);
    }

    .left-section h1,
    .left-section p {
      color: white;
      margin: 0;
      font-size: 16px;
      font-weight: bold;
      line-height: 1.2;
    }

    .left-section p {
      font-size: 15px;
      font-weight: normal;
    }

    .sectiontwo {
      width: 70%;
      /* padding-top: 50px; */
      margin-left: -5%;
    }

    .logos-section {
      position: absolute;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: end;
      top: 15px;
      gap: 10px;
      z-index: 2;
    }

    .logo-img {
      height: 28px;
      width: auto;
      opacity: 0.8;
    }

    .contact-section {
      background: #c41e3a;
      /* padding: 1.5px 0; */
      display: flex;
      align-items: center;
      justify-content: center;
      height: 50px;
      margin-top: 60px;
      gap: 12px;
      z-index: 3;
    }

    .phone-number {
      color: white;
      font-size: 10px;
      font-weight: bold;
      letter-spacing: 1px;
      padding: 5px 10px;
      margin-left: 130px;
    }

    .contact-icons {
      display: flex;
      gap: 8px;
    }

    .icon-circle {
      width: 22px;
      height: 22px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-circle svg {
      width: 18px;
      height: 18px;
    }

    .address-section {
      background: #c41e3a;
      padding: 0 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 10px;
      font-weight: bold;
      flex: 0 0 420px;
    }

    .pronable-section {
      display: flex;

    }

    .childrenOne {
      width: 70%;

    }

    .childrenTwo {
      width: 30%;

    }

    .perent {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .top-plate {
      width: 100%;
      height: auto;
      margin-top: 3px;
      background: white;
      border: 2px solid #999;
      border-radius: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 25px;
      font-weight: 500;
      letter-spacing: 2px;
      color: #000;
    }

    /* Bottom Plate Container */
    .bottom-plate {
      width: 100%;
      height: auto;
      background: white;
      margin-top: 4px;
      border: 2px solid #000;
      border-radius: 10px;
      display: grid;
      grid-template-columns: 1fr 1fr 60px;
      /* Two main columns and a narrow vertical strip */
      overflow: hidden;
    }

    /* Grid Sections */
    .section {
      display: flex;
      justify-content: center;
      align-items: center;
      border: 2px solid #000;
      font-size: 20px;
      font-weight: normal;
    }

    .left-col {
      display: grid;
      grid-template-rows: 1fr 1fr;
    }

    .arabic {
      font-size: 30px;
    }

    .right-strip {
      display: flex;
      justify-content: center;
      align-items: center;
      border-left: 3px solid #000;
      width: 100%;
    }



    @media print {
      body {
        background: white;
        padding: 0;
      }

      .invoice-container {
        box-shadow: none;
      }
    }
  </style>
</head>

<body>
  <div id="invoice-root"></div>

  
        <div class="invoice-container">
          
          <div class="header">
            <div class="logo-section">
              <img src="${providerWorkShopImage}" class="logo" alt="Workshop Logo">
            </div>
            <div class="qr-section">
              <img src="${invoiceQrLink}" class="qr-code" alt="QR Code">
            </div>
            <div class="company-info">
              <div class="company-name">${mockData.providerWorkShopId.workshopNameArabic}</div>
              <div class="company-subtitle">${mockData.providerWorkShopId.workshopNameEnglish}</div>
              <div class="company-details">
                <div>الرقم الضريبي: CR No. : ${mockData.providerWorkShopId.crn}</div>
                <div>الرقم الضريبي: VAT No. : ${mockData.providerWorkShopId.taxVatNumber}</div>
                <div>الحساب البنكي: IBan No. : ${mockData.providerWorkShopId.bankAccountNumber}</div>
              </div>
            </div>
          </div>

          
          <div class="pronable-section">
            <div class="childrenOne">
              <div class="invoice-info">
            <div class="invoice-left">
              <div class="invoice-field">
                <div class="invoice-label">invoice no. <b>رقم الفاتورة</b></div>
                <div class="invoice-value">${mockData._id}</div>
              </div>
              <div class="invoice-field">
                <div class="invoice-label">invoice date <b>تاريخ الفاتورة</b></div>
                <div class="invoice-value">${invoiceCreatedAtt}</div>
              </div>
            </div>
            <div class="invoice-type">
              <div class="invoice-type-label">(Simplified tax invoice)</div>
              <div class="invoice-type-title">فاتورة ضريبية مبسطة</div>
              <div class="payment-method">${mockData.paymentMethod}</div>
            </div>
            ${interNationalCarNumberComponent}
          </div>

          
          <div class="vehicle-info">
            <div class="vehicle-brand">
              <div class="logo-section">
                <img src="${carBrandImage}" class="logo" alt="Car Brand Logo">
              </div>
              <div class="vehicle-model">${mockData.car.brand.title}</div>
            </div>
            <div class="vehicle-model">${mockData.car.model.title}</div>
            <div class="vehicle-year">${mockData.car.year}</div>
            <div style="text-align: center;">
              <div class="tax-info">الرقم الضريبي: VAT -${mockData.providerWorkShopId.taxVatNumber}</div>
              <div class="mobile-number">الجوال: ${mockData.providerWorkShopId.contact}</div>
              <div class="customer-label">العميل: ${mockData.client.clientId.name}</div>
            </div>
          </div>
            </div>
            <div class="childrenTwo">
              

            <div class="perent">
                ${result}
              </div>
              </div>
            </div>

          
          ${worksTableComponent}

          
          ${sparePartsTableComponent}

          
          <div class="bottom-section">
            <div class="terms-section">
              <div class="terms-title">(Warranty and maintenance terms)<br />شروط الضمان والصيانة</div>
              <div class="terms-content">
                المركز يضمن أعمال شغل اليد فقط إذا كانت القطع المستبدلة أصلية ومدة الضمان لا تتجاوز شهر من تاريخ
                الفاتورة<br />
                المركز غير مسئول عن قطع الغيار القديمة بعد استبدالها وعدم قيام العميل بطلبها وأخذها بعد الصيانة مباشرة ويعد
                تصريح مباشر بالاستغناء عنها ولا يسأل عنها الورشة مطلقا<br />
                المركز غير مسئول عن تركيب قطع الغيار المستعملة وفي حالة وجود خلل بها يتطلب الفك والتركيب أكثر من مرة يتحمل
                العميل قيمة شغل اليد عن الفك والتركيب في كل مرة<br />
                المركز غير مسئول عن رسوب السيارة بالفحص الدوري
              </div>
              <div class="manager-section">
                (Workshop Manager)
                <div class="manager-name">اسامة الطاهر</div>
              </div>
            </div>
            <div class="summary-section">
              <div class="summary-row red">
                <div class="summary-label">
                  <span class="summary-icon">${mockData.totalCostOfSparePartsExcludingTax}﷼ </span>
                  <div class="summary-content">
                    <span>إجمالي مبلغ قطع الغيار (Total of spare parts)</span>
                  </div>
                </div>
              </div>
              <div class="summary-row gray">
                <div class="summary-label">
                  <span class="summary-icon">${mockData.totalCostExcludingTax}﷼ </span>
                  <div class="summary-content">
                    <span> (Taxable amount)</span><span>المبلغ الخاضع للضريبة</span>
                  </div>
                </div>
              </div>
              <div class="summary-row gray">
                <div class="summary-label">
                  <span class="summary-icon">${mockData.finalDiscountInFlatAmount || 0}﷼ </span>
                  <div class="summary-content">
                    <span>(Discount)</span><span>الخصم قبل الضريبة</span>
                  </div>
                </div>
              </div>
              <div class="summary-row gray">
                <div class="summary-label">
                  <span class="summary-icon">${mockData.taxAmount || 0}﷼ </span>
                  <div class="summary-content">
                    <span> (VAT amount)</span> <span>(VAT 15%)الضريبة</span>
                  </div>
                </div>
              </div>
              <div class="summary-row blue">
                <div class="summary-label">
                  <span class="summary-icon">﷼ </span>
                  <div class="summary-content">
                    <span>(Total including tax)</span> <span>الإجمالي شامل الضريبة</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
          <div class="banner">
            <div class="left-section">
              <h1>Thank you for your visit and</h1>
              <p>we are always at your service</p>
            </div>
            <div class="sectiontwo">
              <div class="logos-section">
                
                <svg class="logo-img" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="50" cy="30" rx="42" ry="26" fill="none" stroke="#002c5f" stroke-width="3" />
                  <path d="M 20 30 Q 20 20, 35 20 L 35 40 Q 20 40, 20 30 M 80 30 Q 80 20, 65 20 L 65 40 Q 80 40, 80 30" fill="#002c5f" />
                </svg>
                
                <svg class="logo-img" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="50" cy="30" rx="45" ry="26" fill="#0c2d6b" />
                  <text x="50" y="37" text-anchor="middle" font-family="Arial" font-size="20" font-style="italic" font-weight="bold" fill="white">Ford</text>
                </svg>
                
                <svg class="logo-img" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
                  <rect x="18" y="12" width="64" height="36" rx="4" fill="none" stroke="#e40521" stroke-width="4" />
                  <text x="50" y="40" text-anchor="middle" font-family="Arial" font-size="22" font-weight="bold" fill="#e40521">H</text>
                </svg>
                
                <svg class="logo-img" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="50" cy="30" rx="45" ry="25" fill="#bb162b" />
                  <text x="50" y="38" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold" fill="white">KIA</text>
                </svg>
                
                <svg class="logo-img" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="30" r="26" fill="none" stroke="#000" stroke-width="3" />
                  <path d="M 33 30 Q 50 15, 67 30 Q 50 40, 33 30" fill="#000" />
                </svg>
                
                <svg class="logo-img" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="50" cy="30" rx="26" ry="26" fill="none" stroke="#eb0a1e" stroke-width="3" />
                  <ellipse cx="50" cy="30" rx="17" ry="24" fill="none" stroke="#eb0a1e" stroke-width="3" />
                  <ellipse cx="50" cy="30" rx="36" ry="15" fill="none" stroke="#eb0a1e" stroke-width="3" />
                </svg>
                
                <svg class="logo-img" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
                  <text x="50" y="38" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#c8102e">GMC</text>
                </svg>
                
                <svg class="logo-img" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="30" r="26" fill="none" stroke="#000" stroke-width="3" />
                  <rect x="25" y="26" width="50" height="8" fill="#000" />
                  <text x="50" y="34" text-anchor="middle" font-family="Arial" font-size="9" font-weight="bold" fill="#fff">NISSAN</text>
                </svg>
                
                <svg class="logo-img" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 30 18 L 50 30 L 70 18 L 70 42 L 50 30 L 30 42 Z" fill="#d4af37" stroke="#000" stroke-width="1" />
                </svg>
                
                <svg class="logo-img" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="30" r="26" fill="none" stroke="#00adef" stroke-width="3" />
                  <path d="M 50 8 L 50 30 M 50 30 L 68 43 M 50 30 L 32 43" stroke="#00adef" stroke-width="3" stroke-linecap="round" />
                </svg>
              </div>
              <div class="contact-section">
                <div class="phone-number">${mockData.providerWorkShopId.contact}</div>
                <div class="contact-icons">
                  <div class="icon-circle">
                    <svg viewBox="0 0 24 24" fill="#25D366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div class="icon-circle">
                    <svg viewBox="0 0 24 24" fill="#c41e3a">
                      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                    </svg>
                  </div>
                </div>
                <div class="address-section">
                  ${mockData.providerWorkShopId.address}
                </div>
              </div>
            </div>
          </div>
        </div>
</body>

</html>
     `;
};
