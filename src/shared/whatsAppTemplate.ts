import { CLIENT_CAR_TYPE, CLIENT_STATUS } from '../app/modules/client/client.enum';
import { IInvoice, TranslatedFieldEnum } from '../app/modules/invoice/invoice.interface';
import { PaymentMethod } from '../app/modules/payment/payment.enum';
import { IworkShop } from '../app/modules/workShop/workShop.interface';
import config from '../config';
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

const createInvoice = async (data: IInvoice | any, lang: TranslatedFieldEnum) => {
     const isPostPaid = data?.paymentMethod === PaymentMethod.POSTPAID;
     const englishAlphabetCombination = data?.car?.carType == CLIENT_CAR_TYPE.SAUDI ? data?.car?.plateNumberForSaudi?.alphabetsCombinations[0] : '';
     const arabicAlphabetCombination = data?.car?.carType == CLIENT_CAR_TYPE.SAUDI ? data?.car?.plateNumberForSaudi?.alphabetsCombinations[1] : '';
     const englishPlateNumber = data?.car?.carType == CLIENT_CAR_TYPE.SAUDI ? data?.car?.plateNumberForSaudi?.numberEnglish : '';
     const arabicPlateNumber = data?.car?.carType == CLIENT_CAR_TYPE.SAUDI ? data?.car?.plateNumberForSaudi?.numberArabic : '';
     const interNationalCarNumber = data?.car?.carType == CLIENT_CAR_TYPE.INTERNATIONAL ? data?.car?.plateNumberForInternational : '';
     const carSymbol = data?.car?.carType == CLIENT_CAR_TYPE.SAUDI ? data?.car?.plateNumberForSaudi?.symbol?.image : '';

     return `
    <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>pdf-invoice.svg</title>
</head>

<body>
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="595" height="842">
        <defs>
            <linearGradient id="d" x1=".5" x2=".5" y1="-.071" y2=".688" gradientUnits="objectBoundingBox">
                <stop offset="0" stop-color="#ced0d1"></stop>
                <stop offset=".157" stop-color="#f0f0f1"></stop>
                <stop offset=".164" stop-color="#efeff0"></stop>
                <stop offset=".259" stop-color="#e7e7e8"></stop>
                <stop offset=".44" stop-color="#e5e5e6"></stop>
                <stop offset=".56" stop-color="#cececf"></stop>
                <stop offset=".811" stop-color="#939395"></stop>
                <stop offset="1" stop-color="#626366"></stop>
            </linearGradient>
            <linearGradient id="a" x1=".925" x2=".125" y1="2.209" y2="2.973" gradientUnits="objectBoundingBox">
                <stop offset="0" stop-color="#e5e5e6"></stop>
                <stop offset=".44" stop-color="#e5e5e6"></stop>
                <stop offset=".56" stop-color="#cececf"></stop>
                <stop offset=".811" stop-color="#939395"></stop>
                <stop offset="1" stop-color="#626366"></stop>
            </linearGradient>
            <linearGradient xlink:href="#a" id="e" x1=".972" x2="-.118" y1="-.234" y2=".22"></linearGradient>
            <linearGradient xlink:href="#a" id="f" x1=".5" x2=".5" y1="1.601" y2="2.556"></linearGradient>
            <linearGradient id="b" x1=".5" x2=".5" y1="1.041" y2=".041" gradientUnits="objectBoundingBox">
                <stop offset="0" stop-color="#c3c5c7"></stop>
                <stop offset=".049" stop-color="#d3d4d5"></stop>
                <stop offset=".12" stop-color="#e5e5e6"></stop>
                <stop offset=".124" stop-color="#e7e7e8"></stop>
                <stop offset=".147" stop-color="#eeeeef"></stop>
                <stop offset=".21" stop-color="#f0f0f1"></stop>
                <stop offset=".545" stop-color="#f0f0f1"></stop>
                <stop offset=".61" stop-color="#ccccce"></stop>
                <stop offset=".691" stop-color="#a6a7a9"></stop>
                <stop offset=".771" stop-color="#88898b"></stop>
                <stop offset=".85" stop-color="#737477"></stop>
                <stop offset=".928" stop-color="#66676a"></stop>
                <stop offset="1" stop-color="#626366"></stop>
            </linearGradient>
            <linearGradient xlink:href="#b" id="g" x1=".499" x2=".499" y1="1.109" y2="-.025"></linearGradient>
            <linearGradient xlink:href="#b" id="h" x1=".501" x2=".501" y1="2.29" y2=".071"></linearGradient>
            <linearGradient id="i" x1=".5" x2=".5" y1="2.383" y2="1.239" gradientUnits="objectBoundingBox">
                <stop offset=".006" stop-color="#e5e5e6"></stop>
                <stop offset="1" stop-color="#6d6e6f"></stop>
            </linearGradient>
            <linearGradient xlink:href="#a" id="j" x1=".5" x2=".5" y1="3.14" y2="1.568"></linearGradient>
            <linearGradient xlink:href="#a" id="k" x1=".503" x2=".503" y1="3.148" y2="1.57"></linearGradient>
            <linearGradient xlink:href="#a" id="l" x1=".503" x2=".503" y1="1.193" y2="-.432"></linearGradient>
            <linearGradient xlink:href="#a" id="m" x1=".5" x2=".5" y1="1.193" y2="-.432"></linearGradient>
            <clipPath id="c">
                <path d="M0 0h595v842H0z"></path>
            </clipPath>
        </defs>
        <g clip-path="url(#c)">
            <path fill="#fff" d="M0 0h595v842H0z"></path>
            <g data-name="Group 55925">
                <g data-name="Group 55923">
                    <!-- Header Backgrounds -->
                    <path fill="#1771b7" d="M13 248h569v34H13z" data-name="Rectangle 1"></path>
                    <path fill="#1771b7" d="M13 492h569v34H13z" data-name="Rectangle 14"></path>
                    <path fill="#cb3c40" d="M206 815h389v22H206z" data-name="Rectangle 2"></path>
                    <path fill="#1771b7" d="M0 796h206v41H0z" data-name="Rectangle 3"></path>

                    <!-- Header Lines -->
                    <path fill="none" stroke="#fff" stroke-width="2" d="M143.5 249v32" data-name="Line 2"></path>
                    <path fill="none" stroke="#fff" stroke-width="2" d="M143.5 493v32" data-name="Line 8"></path>
                    <path fill="none" stroke="#fff" stroke-width="2" d="M393.5 249v32" data-name="Line 4"></path>
                    <path fill="none" stroke="#fff" stroke-width="2" d="M393.5 493v32" data-name="Line 9"></path>
                    <path fill="none" stroke="#fff" stroke-width="2" d="M433.5 249v32" data-name="Line 5"></path>
                    <path fill="none" stroke="#fff" stroke-width="2" d="M433.5 493v32" data-name="Line 10"></path>
                    <path fill="none" stroke="#fff" stroke-width="2" d="M503.5 249v32" data-name="Line 6"></path>
                    <path fill="none" stroke="#fff" stroke-width="2" d="M503.5 493v32" data-name="Line 11"></path>
                    <path fill="none" stroke="#fff" stroke-width="2" d="M42.5 249v32" data-name="Line 3"></path>
                    <path fill="none" stroke="#fff" stroke-width="2" d="M42.5 493v32" data-name="Line 7"></path>

                    <!-- Company Info -->
                    <text data-name="مركز محمد لصيانة السيارات" font-family="Arial-BoldMT, Arial" font-size="20" font-weight="700" transform="translate(379 38)">
                        <tspan x="0" y="0">${data?.providerWorkShopId?.workshopNameArabic || ''}</tspan>
                    </text>
                    <text data-name="مؤسسة محمد علي التجارية" font-family="ArialMT, Arial" font-size="15" transform="translate(435 64)">
                        <tspan x="0" y="0">${data?.customerInvoiceName || data?.client?.clientId?.name || data?.client?.workShopNameAsClient || ''}</tspan>
                    </text>
                    <text data-name="سجل تجاري" font-family="ArialMT, Arial" font-size="10" transform="translate(524 79)">
                        <tspan x="0" y="0">سجل تجاري</tspan>
                    </text>
                    <text data-name="1010347328" font-family="Calibri" font-size="10" transform="translate(463 80)">
                        <tspan x="0" y="0">${data?.providerWorkShopId?.crn || ''}</tspan>
                    </text>
                    <text data-name="300787972600003" font-family="Calibri" font-size="10" transform="translate(438 94)">
                        <tspan x="0" y="0">${data?.providerWorkShopId?.taxVatNumber || ''}</tspan>
                    </text>
                    <text data-name="الرقم الضريبي" font-family="ArialMT, Arial" font-size="10" transform="translate(518 93)">
                        <tspan x="0" y="0">الرقم الضريبي</tspan>
                    </text>

                    <!-- Vehicle Info Background -->
                    <path fill="#eee" d="M13 177h432v31H13z" data-name="Rectangle 4"></path>
                    <text font-family="Calibri" font-size="18" transform="translate(88 199)">
                        <tspan x="0" y="0">${data?.car?.brand?.title || ''}</tspan>
                    </text>
                    <text font-family="Calibri" font-size="18" transform="translate(235 199)">
                        <tspan x="0" y="0">${data?.car?.model?.title || ''}</tspan>
                    </text>
                    <text data-name="2020" font-family="Calibri" font-size="18" transform="translate(380 199)">
                        <tspan x="0" y="0">${data?.car?.year || ''}</tspan>
                    </text>

                    <!-- Customer Info Row -->
                    <g fill="#fff" stroke="#f3f3f3" data-name="Rectangle 5">
                        <path stroke="none" d="M13 212h569v30H13z"></path>
                        <path fill="none" d="M13.5 212.5h568v29h-568z"></path>
                    </g>
                    <text font-family="Arial-BoldMT, Arial" font-size="14" font-weight="700" transform="translate(556 232)">
                        <tspan x="-13.645" y="0">العميل</tspan>
                    </text>
                    <text data-name="Mohammad Ahmed" font-family="Calibri" font-size="12" transform="translate(489 231)">
                        <tspan x="-48.844" y="0">${data?.customerInvoiceName || data?.client?.clientId?.name || ''}</tspan>
                    </text>
                    <text font-family="Arial-BoldMT, Arial" font-size="14" font-weight="700" transform="translate(317 232)">
                        <tspan x="-14.656" y="0">الجوال</tspan>
                    </text>
                    <text data-name="966-5xxxxxxxx" font-family="Calibri" font-size="12" transform="translate(260 232)">
                        <tspan x="-34.79" y="0">${data?.client?.contact || ''}</tspan>
                    </text>
                    <text data-name="الرقم الضريبي" font-family="Arial-BoldMT, Arial" font-size="14" font-weight="700" transform="translate(169 232)">
                        <tspan x="-32.214" y="0">الرقم الضريبي</tspan>
                    </text>
                    <text data-name="VAT 3xxxxxxxxxxxxx3" font-family="Calibri" font-size="12" transform="translate(77 232)">
                        <tspan xml:space="preserve" x="-95.627" y="0">${data?.providerWorkShopId?.taxVatNumber || ''}</tspan>
                    </text>

                    <!-- Invoice Details -->
                    <text fill="#cb3c40" data-name="رقم الفاتورة" font-family="Arial-BoldMT, Arial" font-size="12" font-weight="700" transform="translate(179 144)">
                        <tspan x="-23.3" y="0">رقم الفاتورة</tspan>
                    </text>
                    <text data-name="1062" font-family="Calibri-Bold, Calibri" font-size="12" font-weight="700" transform="translate(117 143)">
                        <tspan x="-12.164" y="0">${data?._id || ''}</tspan>
                    </text>
                    <text data-name="PM 09:43 25-10-2025" font-family="Calibri" font-size="10" transform="translate(84 166)">
                        <tspan xml:space="preserve" x="-81.059" y="0">${data?.createdAt || ''}</tspan>
                    </text>
                    <text fill="#cb3c40" data-name="وقت وتاريخ الفاتورة" font-family="Arial-BoldMT, Arial" font-size="12" font-weight="700" transform="translate(182 167)">
                        <tspan x="-40.131" y="0">وقت وتاريخ الفاتورة</tspan>
                    </text>
                    <text fill="#cb3c40" data-name="نقدي - Cash" font-family="Arial-BoldMT, Arial" font-size="12" font-weight="700" transform="translate(301 157)">
                        <tspan x="-29.502" y="0">نقدي</tspan>
                        <tspan xml:space="preserve" y="0">- ${data?.paymentMethod || ''}</tspan>
                    </text>
                    <text fill="#cb3c40" data-name="آجل - Postpaid" font-family="Arial-BoldMT, Arial" font-size="12" font-weight="700" transform="translate(302 171)">
                        <tspan x="-37.945" y="0">${isPostPaid ? 'آجل' : 'نقدي'}</tspan>
                        <tspan xml:space="preserve" y="0">- Postpaid</tspan>
                    </text>
                    <text data-name="فاتورة ضريبية مبسطة" font-family="Arial-BoldMT, Arial" font-size="15" font-weight="700" transform="translate(299 127)">
                        <tspan x="-54.448" y="0">فاتورة ضريبية مبسطة</tspan>
                    </text>
                    <text data-name="(Simplified tax invoice)" font-family="Calibri" font-size="10" transform="translate(302 139)">
                        <tspan x="-45.833" y="0">(Simplified tax invoice)</tspan>
                    </text>

                    <!-- Triangle -->
                    <path fill="#1771b7" d="m206 796 33.5 41h-67Z" data-name="Polygon 1"></path>

                    <!-- Works Table Headers -->
                    <g fill="#fff" stroke="#f3f3f3" data-name="Rectangle 6">
                        <path stroke="none" d="M13 282h569v25H13z"></path>
                        <path fill="none" d="M13.5 282.5h568v24h-568z"></path>
                    </g>
                    <path fill="#f3f3f3" d="M13 307h569v25H13z" data-name="Rectangle 7"></path>
                    <g fill="#fff" stroke="#f3f3f3" data-name="Rectangle 8">
                        <path stroke="none" d="M13 332h569v25H13z"></path>
                        <path fill="none" d="M13.5 332.5h568v24h-568z"></path>
                    </g>
                    <path fill="#f3f3f3" d="M13 357h569v25H13z" data-name="Rectangle 9"></path>

                    <!-- Works Table Rows -->
                    ${
                         data.worksList && data.worksList.length > 0
                              ? data.worksList
                                     .map((workItem: any, index: any) => {
                                          const work = workItem.work;
                                          const workNameArabic = work?.title?.ar || '';
                                          const workNameEnglish = work?.title?.en || '';
                                          const workCode = work?.code || '';
                                          const workQuantity = workItem.quantity || '';
                                          const workPrice = workItem.cost || '';
                                          const workFinalCost = workItem.finalCost || '';
                                          const rowY = 282 + index * 25;

                                          return `
        <!-- Row Background -->
        ${
             index % 2 === 0
                  ? `<path fill="#f3f3f3" d="M13 ${rowY}h569v25H13z"></path>`
                  : `<g fill="#fff" stroke="#f3f3f3">
                <path stroke="none" d="M13 ${rowY}h569v25H13z"></path>
                <path fill="none" d="M13.5 ${rowY + 0.5}h568v24h-568z"></path>
            </g>`
        }

        <!-- Row Content -->
        <text data-name="${index + 1}" font-family="Calibri-Bold, Calibri" font-size="12" font-weight="700" transform="translate(26 ${rowY + 17})">
            <tspan x="-3.041" y="0">${index + 1}</tspan>
        </text>
        <text data-name="${workCode}" font-family="Calibri-Bold, Calibri" font-size="12" font-weight="700" transform="translate(84 ${rowY + 17})">
            <tspan x="-12.164" y="0">${workCode}</tspan>
        </text>
        <text data-name="${workQuantity}" font-family="Calibri-Bold, Calibri" font-size="12" font-weight="700" transform="translate(415 ${rowY + 17})">
            <tspan x="-3.041" y="0">${workQuantity}</tspan>
        </text>
        <text data-name="${workPrice}" font-family="Calibri-Bold, Calibri" font-size="12" font-weight="700" transform="translate(469 ${rowY + 17})">
            <tspan x="-13.767" y="0">${workPrice}</tspan>
        </text>
        <text data-name="${workFinalCost}" font-family="Calibri-Bold, Calibri" font-size="12" font-weight="700" transform="translate(543 ${rowY + 17})">
            <tspan x="-13.767" y="0">${workFinalCost}</tspan>
        </text>
        <text data-name="${workNameEnglish}" font-family="Calibri" font-size="10" transform="translate(273 ${rowY + 21})">
            <tspan x="-64.036" y="0">${workNameEnglish}</tspan>
        </text>
        <text data-name="${workNameArabic}" font-family="ArialMT, Arial" font-size="10" transform="translate(273 ${rowY + 10})">
            <tspan x="-43.318" y="0">${workNameArabic}</tspan>
        </text>
    `;
                                     })
                                     .join('')
                              : ''
                    }

                    <!-- Spare Parts Table Headers -->
                    <g fill="#fff" stroke="#f3f3f3" data-name="Rectangle 15">
                        <path stroke="none" d="M13 526h569v18H13z"></path>
                        <path fill="none" d="M13.5 526.5h568v17h-568z"></path>
                    </g>
                    <path fill="#f3f3f3" d="M13 544h569v18H13z" data-name="Rectangle 16"></path>
                    <g fill="#fff" stroke="#f3f3f3" data-name="Rectangle 17">
                        <path stroke="none" d="M13 562h569v18H13z"></path>
                        <path fill="none" d="M13.5 562.5h568v17h-568z"></path>
                    </g>
                    <path fill="#f3f3f3" d="M13 580h569v18H13z" data-name="Rectangle 18"></path>
                    <g fill="#fff" stroke="#f3f3f3" data-name="Rectangle 24">
                        <path stroke="none" d="M13 598h569v18H13z"></path>
                        <path fill="none" d="M13.5 598.5h568v17h-568z"></path>
                    </g>

                    <!-- Spare Parts Table Rows -->
                    ${
                         data.sparePartsList && data.sparePartsList.length > 0
                              ? data.sparePartsList
                                     .map((sparePart: any, index: any) => {
                                          const sparePartName = sparePart.itemName || '';
                                          // const sparePartNameObj = await buildTranslatedField(sparePart.itemName as any);
                                          // const sparePartNameArabic = sparePartNameObj['ar'];
                                          // const sparePartNameEnglish = sparePartNameObj['en'];
                                          const sparePartQuantity = sparePart.quantity || '';
                                          const sparePartCost = sparePart.cost || '';
                                          const sparePartTotalCost = sparePart.finalCost || '';
                                          const sparePartCode = sparePart.code || '';
                                          const rowY = 526 + index * 18;

                                          return `
        <!-- Row Background -->
        ${
             index % 2 === 0
                  ? `<path fill="#f3f3f3" d="M13 ${rowY}h569v18H13z"></path>`
                  : `<g fill="#fff" stroke="#f3f3f3">
                <path stroke="none" d="M13 ${rowY}h569v18H13z"></path>
                <path fill="none" d="M13.5 ${rowY + 0.5}h568v17h-568z"></path>
            </g>`
        }

        <!-- Row Content -->
        <text data-name="${index + 1}" font-family="Calibri-Bold, Calibri" font-size="12" font-weight="700" transform="translate(26 ${rowY + 12})">
            <tspan x="-3.041" y="0">${index + 1}</tspan>
        </text>
        <text data-name="${sparePartCode}" font-family="Calibri-Bold, Calibri" font-size="12" font-weight="700" transform="translate(88 ${rowY + 12})">
            <tspan x="-18.246" y="0">${sparePartCode}</tspan>
        </text>
        <text data-name="${sparePartQuantity}" font-family="Calibri-Bold, Calibri" font-size="12" font-weight="700" transform="translate(415 ${rowY + 12})">
            <tspan x="-3.041" y="0">${sparePartQuantity}</tspan>
        </text>
        <text data-name="${sparePartCost}" font-family="Calibri-Bold, Calibri" font-size="12" font-weight="700" transform="translate(469 ${rowY + 12})">
            <tspan x="-10.726" y="0">${sparePartCost}</tspan>
        </text>
        <text data-name="${sparePartTotalCost}" font-family="Calibri-Bold, Calibri" font-size="12" font-weight="700" transform="translate(543 ${rowY + 12})">
            <tspan x="-13.767" y="0">${sparePartTotalCost}</tspan>
        </text>
        <text data-name="${sparePartName}" font-family="ArialMT, Arial" font-size="10" transform="translate(271 ${rowY + 12})">
            <tspan x="-42.637" y="0">${sparePartName}</tspan>
        </text>
    `;
                                     })
                                     .join('')
                              : ''
                    }

                    <!-- Totals Backgrounds -->
                    <path fill="#f3f3f3" d="M344 672h238v28H344z" data-name="Rectangle 19"></path>
                    <path fill="#cb3c40" d="M344 624h238v35H344z" data-name="Rectangle 25"></path>
                    <path fill="#f3f3f3" d="M344 703h238v28H344z" data-name="Rectangle 22"></path>
                    <path fill="#f3f3f3" d="M344 734h238v28H344z" data-name="Rectangle 20"></path>
                    <path fill="#1771b7" d="M344 765h238v35H344z" data-name="Rectangle 21"></path>

                    <!-- Table Headers Text -->
                    <text fill="#fff" font-family="ArialMT, Arial" font-size="14" letter-spacing=".07em" transform="translate(27 270)">
                        <tspan x="-5.055" y="0">N</tspan>
                    </text>
                    <text fill="#fff" data-name="N" font-family="ArialMT, Arial" font-size="14" letter-spacing=".07em" transform="translate(28 514)">
                        <tspan x="-5.055" y="0">N</tspan>
                    </text>
                    <text fill="#fff" data-name="الرمز Code" font-family="ArialMT, Arial" font-size="14" transform="translate(88 263)">
                        <tspan x="-12.5" y="0">الرمز</tspan>
                        <tspan x="-16.734" y="15">Code</tspan>
                    </text>
                    <text fill="#fff" data-name="الرمز Code" font-family="ArialMT, Arial" font-size="14" transform="translate(88 507)">
                        <tspan x="-12.5" y="0">الرمز</tspan>
                        <tspan x="-16.734" y="15">Code</tspan>
                    </text>
                    <text fill="#fff" data-name="Works الأعــمــال" font-family="ArialMT, Arial" font-size="14" text-align="center" transform="translate(281 271)">
                        <tspan xml:space="preserve" x="-68.52" y="0">Works</tspan>
                        <tspan y="0" font-family="Arial-BoldMT, Arial" font-size="15" font-weight="700">الأعــمــال</tspan>
                    </text>
                    <text fill="#fff" data-name="Spare Parts قطع غيار" font-family="ArialMT, Arial" font-size="14" transform="translate(271 515)">
                        <tspan xml:space="preserve" x="-68.065" y="0">Spare Parts</tspan>
                        <tspan y="0" font-family="Arial-BoldMT, Arial" font-weight="700">قطع غيار</tspan>
                    </text>
                    <text fill="#fff" data-name="عدد Qt." font-family="ArialMT, Arial" font-size="14" transform="translate(415 261)">
                        <tspan x="-8.405" y="0">عدد</tspan>
                        <tspan x="-9.334" y="15">Qt.</tspan>
                    </text>
                    <text fill="#fff" data-name="عدد Qt." font-family="ArialMT, Arial" font-size="14" transform="translate(415 505)">
                        <tspan x="-8.405" y="0">عدد</tspan>
                        <tspan x="-9.334" y="15">Qt.</tspan>
                    </text>
                    <text fill="#fff" data-name="السعر Price" font-family="ArialMT, Arial" font-size="14" transform="translate(469 263)">
                        <tspan x="-12.793" y="0">السعر</tspan>
                        <tspan x="-15.948" y="15">Price</tspan>
                    </text>
                    <text fill="#fff" data-name="السعر Price" font-family="ArialMT, Arial" font-size="14" transform="translate(469 507)">
                        <tspan x="-12.793" y="0">السعر</tspan>
                        <tspan x="-15.948" y="15">Price</tspan>
                    </text>
                    <text fill="#fff" data-name="الإجمالي Total" font-family="ArialMT, Arial" font-size="14" transform="translate(543 263)">
                        <tspan x="-18.898" y="0">الإجمالي</tspan>
                        <tspan x="-14.786" y="15">Total</tspan>
                    </text>
                    <text fill="#fff" data-name="الإجمالي Total" font-family="ArialMT, Arial" font-size="14" transform="translate(543 507)">
                        <tspan x="-18.898" y="0">الإجمالي</tspan>
                        <tspan x="-14.786" y="15">Total</tspan>
                    </text>

                    <!-- Totals Text -->
                    <text data-name="المبلغ الخاضع للضريبة" font-family="ArialMT, Arial" font-size="14" transform="translate(527 691)">
                        <tspan x="-51.43" y="0">المبلغ الخاضع للضريبة</tspan>
                    </text>
                    <text fill="#fff" data-name="إجمالي مبلغ قطع الغيار" font-family="Arial-BoldMT, Arial" font-size="14" font-weight="700" transform="translate(526 641)">
                        <tspan x="-52.298" y="0">إجمالي مبلغ قطع الغيار</tspan>
                    </text>
                    <text fill="#fff" data-name="(Total of spare parts)" font-family="Calibri" font-size="10" transform="translate(529 654)">
                        <tspan x="-41.909" y="0">(Total of spare parts)</tspan>
                    </text>
                    <text fill="#fff" data-name="255" font-family="Calibri-Bold, Calibri" font-size="16" font-weight="700" transform="translate(399 647)">
                        <tspan x="-22.41" y="0">${data?.totalCostOfSparePartsExcludingTax || ''}</tspan>
                    </text>
                    <text data-name="الخصم قبل الضريبة" font-family="ArialMT, Arial" font-size="14" transform="translate(534 722)">
                        <tspan x="-44.198" y="0">الخصم قبل الضريبة</tspan>
                    </text>
                    <text fill="#fff" data-name="الإجمالي شامل الضريبة" font-family="Arial-BoldMT, Arial" font-size="15" font-weight="700" transform="translate(521 782)">
                        <tspan x="-56.741" y="0">الإجمالي شامل الضريبة</tspan>
                    </text>
                    <text fill="#fff" data-name="621" font-family="Calibri-Bold, Calibri" font-size="16" font-weight="700" transform="translate(399 788)">
                        <tspan x="-22.41" y="0">${data?.finalCost || ''}</tspan>
                    </text>
                    <text fill="#fff" data-name="(Total including tax)" font-family="Calibri" font-size="10" transform="translate(524 796)">
                        <tspan x="-39.624" y="0">(Total including tax)</tspan>
                    </text>
                    <text data-name="81" font-family="Calibri" font-size="12" transform="translate(391 753)">
                        <tspan x="-13.679" y="0">${data?.taxAmount || ''}</tspan>
                    </text>
                    <text data-name="10" font-family="Calibri" font-size="12" transform="translate(391 722)">
                        <tspan x="-13.679" y="0">${data?.finalDiscountInFlatAmount || ''}</tspan>
                    </text>
                    <text data-name="550" font-family="Calibri" font-size="12" transform="translate(394 691)">
                        <tspan x="-16.72" y="0">${data?.totalCostExcludingTax || ''}</tspan>
                    </text>
                    <text data-name="(VAT 15%) الضريبة" font-family="ArialMT, Arial" font-size="12" transform="translate(529 753)">
                        <tspan x="-48.573" y="0">(VAT 15%)</tspan>
                        <tspan y="0" font-size="14"></tspan>
                        <tspan y="0" font-size="14">الضريبة</tspan>
                    </text>

                    <!-- Warranty Section -->
                    <g fill="#fff" stroke="#f3f3f3" data-name="Rectangle 23">
                        <path stroke="none" d="M13 624h288v124H13z"></path>
                        <path fill="none" d="M13.5 624.5h287v123h-287z"></path>
                    </g>
                    <text data-name="شروط الضمان والصيانة" font-family="Arial-BoldMT, Arial" font-size="14" font-weight="700" transform="translate(157 639)">
                        <tspan x="-54.954" y="0">شروط الضمان والصيانة</tspan>
                    </text>
                    <text data-name="المركز يضمن أعمال شغل اليد فقط إذا كانت القطع المستبدلة أصليه ومدة الضمان لا تتجاوز شهر من تاريخ الفاتورة المركز غير مسئول عن قطع الغيار القديمة بعد استبدالها وعدم قيام العميل بطلبها وأخذها بعد الصيانة مباشرة ويعد تصريح مباشر بالاستغناء عنها ولا يسأل عنها" font-family="ArialMT, Arial" font-size="10" transform="translate(295 661)">
                        <tspan x="-254.478" y="0">المركز يضمن أعمال شغل اليد فقط إذا كانت القطع المستبدلة أصليه ومدة الضمان</tspan>
                        <tspan x="-105.21" y="13">لا تتجاوز شهر من تاريخ الفاتورة</tspan>
                        <tspan x="-276.348" y="26">المركز غير مسئول عن قطع الغيار القديمة بعد استبدالها وعدم قيام العميل بطلبها وأخذها</tspan>
                        <tspan x="-267.383" y="39">بعد الصيانة مباشرة ويعد تصريح مباشر بالاستغناء عنها ولا يسأل عنها الورشة مطلقاً</tspan>
                        <tspan x="-267.788" y="52">المركز غير مسئول عن تركيب قطع الغيار المستعملة وفي حالة وجود خلل بها يتطلب</tspan>
                        <tspan x="-275.552" y="65">الفك والتركيب أكثر من مرة يتحمل العميل قيمة شغل اليد عن الفك والتركيب في كل مرة</tspan>
                        <tspan x="-177.788" y="78">المركز غير مسئول عن رسوب السيارة بالفحص الدوري</tspan>
                    </text>
                    <text data-name="مدير الورشة" font-family="Arial-BoldMT, Arial" font-size="15" font-weight="700" transform="translate(171 771)">
                        <tspan x="-30.736" y="0">مدير الورشة</tspan>
                    </text>
                    <text data-name="(Workshop Manager)" font-family="Calibri" font-size="8" transform="translate(171 781)">
                        <tspan x="-34.471" y="0">(Workshop Manager)</tspan>
                    </text>
                    <text data-name="Asif Abdulwadud" font-family="Calibri" font-size="10" transform="translate(88 775)">
                        <tspan x="-34.368" y="0">${data?.providerWorkShopId?.ownerId?.name || ''}</tspan>
                    </text>

                    <!-- Bank Account -->
                    <text data-name="الحساب البنكي" font-family="ArialMT, Arial" font-size="10" transform="translate(518 106)">
                        <tspan x="0" y="0">الحساب البنكي</tspan>
                    </text>
                    <text font-family="Calibri" font-size="9" transform="translate(404 107)">
                        <tspan x="0" y="0">${data?.providerWorkShopId?.bankAccountNumber || ''}</tspan>
                    </text>

                    <!-- QR Code Placeholder -->
                    <path fill="none" d="M411.082 793.031h24.6v24.6h-24.6Z"></path>

                    <!-- Toyota Logo -->
                    <g data-name="Toyota">
                        <path fill="#272425" d="M36 193c0 5.508 7.214 10 16.091 10s16.091-4.492 16.091-10-7.214-10-16.091-10S36 187.492 36 193m.173 0c0-5.443 7.149-9.849 15.918-9.849S68.03 187.557 68.03 193s-7.149 9.849-15.94 9.849-15.917-4.428-15.917-9.849" data-name="Path 1003"></path>
                        <path fill="#272425" d="M50.578 184.857c-3.693.216-6.458 1.21-6.89 2.441a1 1 0 0 0-.065.346 1.2 1.2 0 0 0 .173.583c.5.864 2.1 1.577 4.384 1.965l.065.022.022-.065c.389-2.376 1.253-4.255 2.376-5.14l.194-.151Zm-6.652 3.3a1.1 1.1 0 0 1-.151-.5.7.7 0 0 1 .065-.3c.41-1.145 3.067-2.1 6.523-2.333a8.82 8.82 0 0 0-2.246 5.011c-2.16-.389-3.736-1.08-4.19-1.879Zm6.091 2.186-.022.086h.083a30 30 0 0 0 3.974 0h.086l-.022-.086c-.346-1.987-1.145-3.218-2.073-3.218-.886 0-1.663 1.231-2.03 3.218Zm2.073-3.067c.821 0 1.533 1.166 1.879 3.024q-.94.065-1.879.065a27 27 0 0 1-1.879-.065c.324-1.879 1.059-3.024 1.88-3.024Zm1.469-2.289c1.123.886 1.965 2.765 2.354 5.140l.022.065.065-.022c2.289-.389 3.866-1.1 4.384-1.965a1.1 1.1 0 0 0 .108-.929c-.454-1.253-3.2-2.225-6.89-2.441l-.259-.022Zm.259.043c3.456.238 6.134 1.188 6.523 2.333a2 2 0 0 1 .065.3.9.9 0 0 1-.151.5c-.454.778-2.03 1.49-4.212 1.879a8.54 8.54 0 0 0-2.225-5.012m-12.591 3.326a6.34 6.34 0 0 0-2.549 4.795c0 4.1 5.054 7.6 11.771 8.1l.238.022-.173-.151c-1.533-1.3-2.484-4.384-2.484-8.013l.022-.713-.065-.022c-3.693-.67-6.242-2.181-6.631-3.974l-.043-.13Zm-2.4 4.795a6.06 6.06 0 0 1 2.4-4.579c.475 1.771 3 3.283 6.631 3.952 0 .108-.022.583-.022.583 0 3.542.907 6.566 2.354 7.97-6.479-.562-11.361-3.931-11.361-7.927Zm10.994-.454v.086c0 3.2.994 5.68 2.268 5.68 1.253 0 2.246-2.484 2.246-5.68v-.169h-.065c-.713.065-1.447.086-2.181.086s-1.469-.022-2.181-.086h-.086Zm.151.086c.691.043 1.4.086 2.117.086s1.425-.022 2.117-.086c0 3.11-.929 5.529-2.117 5.529-1.186.023-2.111-2.418-2.111-5.528Zm12.851-4.384c-.389 1.771-2.916 3.3-6.631 3.974l-.065.022.022.713c0 3.629-.95 6.717-2.484 8.013l-.173.151.238-.022c6.717-.5 11.771-3.974 11.771-8.1a6.34 6.34 0 0 0-2.549-4.795l-.108-.086Zm.13.173a6.1 6.1 0 0 1 2.4 4.579c0 3.974-4.881 7.365-11.4 7.9 1.447-1.4 2.354-4.428 2.354-7.97 0 0-.022-.475-.022-.583 3.672-.67 6.177-2.16 6.674-3.931Z" data-name="Path 1004"></path>
                    </g>

                    <!-- Currency Symbols -->
                    <g fill="#fff">
                        <path d="M358.372 647.254a8 8 0 0 0-.665 2.484l7.354-1.563a8 8 0 0 0 .665-2.484Z" data-name="Path 28007"></path>
                        <path d="M365.231 644.582a6.2 6.2 0 0 0 .5-1.9l-4.265.93v-1.783l3.77-.821a6.2 6.2 0 0 0 .5-1.9l-4.275.93v-6.426a6.1 6.1 0 0 0-1.706 1.468v5.333l-1.706.372v-8.047a6 6 0 0 0-1.706 1.467v6.95l-3.817.832a6.2 6.2 0 0 0-.5 1.9l4.312-.939v2.251l-4.617 1.002a6.2 6.2 0 0 0-.5 1.9l4.838-1.054a1.54 1.54 0 0 0 .952-.651l.887-1.348a.9.9 0 0 0 .146-.489v-1.987l1.706-.372v3.575l5.476-1.194Z" data-name="Path 28008"></path>
                    </g>
                    <g fill="#fff" data-name="Saudi_Riyal_Symbol">
                        <path d="M360.708 789.14a6 6 0 0 0-.5 1.86l5.506-1.17a6 6 0 0 0 .5-1.86Z" data-name="Path 28007"></path>
                        <path d="M365.719 786.162a6.5 6.5 0 0 0 .5-1.946l-4.265.955v-1.836l3.77-.843a6.5 6.5 0 0 0 .5-1.946l-4.275.954v-6.6a6.1 6.1 0 0 0-1.706 1.5v5.481l-1.706.382V774a6.1 6.1 0 0 0-1.706 1.507v7.137l-3.817.856a6.5 6.5 0 0 0-.5 1.946l4.312-.965v2.312l-4.617 1.032a6.5 6.5 0 0 0-.5 1.946l4.838-1.082a1.54 1.54 0 0 0 .952-.669l.887-1.384a.93.93 0 0 0 .146-.5V784.1l1.706-.382v3.671l5.476-1.226Z" data-name="Path 28008"></path>
                    </g>
                    <g data-name="Saudi_Riyal_Symbol">
                        <path d="M358.409 754.516a8 8 0 0 0-.665 2.484l7.354-1.563a8 8 0 0 0 .665-2.484Z" data-name="Path 28007"></path>
                        <path d="M365.268 751.844a6.2 6.2 0 0 0 .5-1.9l-4.265.93v-1.783l3.77-.821a6.2 6.2 0 0 0 .5-1.9l-4.275.93v-6.426a6.1 6.1 0 0 0-1.706 1.468v5.333l-1.706.372V740a6 6 0 0 0-1.706 1.467v6.95l-3.817.832a6.2 6.2 0 0 0-.5 1.9l4.312-.939v2.251l-4.617 1.002a6.2 6.2 0 0 0-.5 1.9l4.838-1.054a1.54 1.54 0 0 0 .952-.651l.887-1.348a.9.9 0 0 0 .146-.489v-1.987l1.706-.372v3.575l5.476-1.194Z" data-name="Path 28008"></path>
                    </g>
                    <g data-name="Saudi_Riyal_Symbol">
                        <path d="M358.372 723.516a8 8 0 0 0-.665 2.484l7.354-1.563a8 8 0 0 0 .665-2.484Z" data-name="Path 28007"></path>
                        <path d="M365.231 720.844a6.2 6.2 0 0 0 .5-1.9l-4.265.93v-1.783l3.77-.821a6.2 6.2 0 0 0 .5-1.9l-4.275.93v-6.426a6.1 6.1 0 0 0-1.706 1.468v5.333l-1.706.372V709a6 6 0 0 0-1.706 1.467v6.95l-3.817.832a6.2 6.2 0 0 0-.5 1.9l4.312-.939v2.251l-4.617 1.002a6.2 6.2 0 0 0-.5 1.9l4.838-1.054a1.54 1.54 0 0 0 .952-.651l.887-1.348a.9.9 0 0 0 .146-.489v-1.987l1.706-.372v3.575l5.476-1.194Z" data-name="Path 28008"></path>
                    </g>
                    <g data-name="Saudi_Riyal_Symbol">
                        <path d="M358.409 692.516a8 8 0 0 0-.665 2.484l7.354-1.563a8 8 0 0 0 .665-2.484Z" data-name="Path 28007"></path>
                        <path d="M365.268 689.844a6.2 6.2 0 0 0 .5-1.9l-4.265.93v-1.783l3.77-.821a6.2 6.2 0 0 0 .5-1.9l-4.275.93v-6.426a6.1 6.1 0 0 0-1.706 1.468v5.333l-1.706.372V678a6 6 0 0 0-1.706 1.467v6.95l-3.817.832a6.2 6.2 0 0 0-.5 1.9l4.312-.939v2.251l-4.617 1.002a6.2 6.2 0 0 0-.5 1.9l4.838-1.054a1.54 1.54 0 0 0 .952-.651l.887-1.348a.9.9 0 0 0 .146-.489v-1.987l1.706-.372v3.575l5.476-1.194Z" data-name="Path 28008"></path>
                    </g>

                    <!-- Saudi Emblem -->
                    <g data-name="Group 90">
                        <g data-name="#3f3f41ff">
                            <path d="M452.007 145.185a6.2 6.2 0 0 1 1.965-.249q62.586.05 125.166.028a2.575 2.575 0 0 1 2.823 2.84c.066 18.844-.011 37.688.039 56.532-.011 1.3.017 3.095-1.45 3.648-1.722.487-3.543.232-5.309.288q-60.634-.025-121.268-.006c-1.34.066-3.023-.31-3.333-1.849a46 46 0 0 1-.116-5.453q0-26.306-.006-52.624c-.055-1.19.2-2.707 1.489-3.155m1.1 1.688c-.9.144-.775 1.373-.886 2.054-.033 7.938.022 15.888-.022 23.826.055.98-.138 2.187.819 2.812a10.5 10.5 0 0 0 2.087.188q26.024-.042 52.054-.011a33.5 33.5 0 0 0 5.425-.177c1.135-.742.747-2.22.847-3.36-.072-7.933.061-15.866-.061-23.793.155-1.672-1.616-1.843-2.856-1.794q-26.315.017-52.629 0a20.3 20.3 0 0 0-4.777.255m62.671.061c-.864.548-.626 1.655-.7 2.513.044 8.11-.022 16.226.033 24.336a1.7 1.7 0 0 0 1.993 1.938c13.485.055 26.976-.017 40.462.033.98-.033 2.081.083 2.884-.609.542-2.231.166-4.567.266-6.842-.105-7.1.216-14.222-.172-21.319a42.4 42.4 0 0 0-7.994-.360c-11.454 0-22.913.017-34.367-.011a6.4 6.4 0 0 0-2.408.321m47.459-.105c-1.074.172-.941 1.34-1.008 2.159q-.008 25.991-.006 51.993a31 31 0 0 0 .133 4.584c.5 1.1 1.893.88 2.884.985 4.257-.022 8.52.072 12.777-.044a1.67 1.67 0 0 0 1.987-1.777c.055-18.429-.017-36.858.033-55.287-.033-.941.127-2.375-1.074-2.657-2.879-.376-5.8-.061-8.691-.155-2.342.089-4.728-.249-7.036.2m-110.402 30.884c-.736.714-.587 1.8-.637 2.724q.033 11.393 0 22.786a5.64 5.64 0 0 0 .5 2.928 8.5 8.5 0 0 0 2.934.41q27.162-.017 54.329 0a8.1 8.1 0 0 0 2.94-.410 5.3 5.3 0 0 0 .526-2.934c-.028-6.1-.017-12.2-.011-18.3-.028-2.452.188-4.949-.41-7.357-2.868-.2-5.746-.1-8.619-.116-16.436-.011-32.872.017-49.308-.017a6.4 6.4 0 0 0-2.248.288m62.367.814c-.266 2.3-.05 4.628-.105 6.942.055 6.881-.127 13.762.1 20.643a36.3 36.3 0 0 0 8.016.443q14.673-.008 29.34 0c2.685-.022 5.409.177 8.049-.437.255-6.693.05-13.4.111-20.1-.066-2.5.183-5.021-.116-7.512-.221-1.135-1.611-1.063-2.5-1.085q-20.211.033-40.423.006c-.925.002-2.181-.015-2.469 1.098Z" data-name="Path 259"></path>
                        </g>
                        
                        <text data-name="د ق ط" font-family="Arial-BoldMT, Arial" font-size="14" font-weight="700" letter-spacing=".07em" transform="translate(538.67 165.959)">
                            <tspan x="-16.199" y="0">${arabicAlphabetCombination || ''}</tspan>
                        </text>
                        <text data-name="T G D" font-family="Calibri-Bold, Calibri" font-size="14" font-weight="700" letter-spacing=".07em" transform="translate(537.67 194.858)">
                            <tspan x="-17.464" y="0">${englishAlphabetCombination || ''}</tspan>
                        </text>
                        <text data-name="6430" font-family="Calibri" font-size="18" letter-spacing=".07em" transform="translate(483.658 196.501)">
                            <tspan x="-20.136" y="0">${englishPlateNumber || ''}</tspan>
                        </text>
                        <text data-name="6430" font-family="Calligraphr-Regular, Calligraphr" font-size="16" letter-spacing=".07em" transform="translate(483.91 166.803)">
                            <tspan x="-19.616" y="0">${arabicPlateNumber || ''}</tspan>
                        </text>
                        <img x="13" y="38" width="120" height="120" src="${config.backend_url} + (${carSymbol} || '')" preserveAspectRatio="xMidYMid meet"/>
                    </g>

                    <!-- License Plate -->
                    <g data-name="Group 55920">
                        <g fill="#fff" stroke="#959595" data-name="Rectangle 5385" transform="translate(451 113)">
                            <rect width="131" height="28" stroke="none" rx="4"></rect>
                            <rect width="130" height="27" x=".5" y=".5" fill="none" rx="3.5"></rect>
                        </g>
                        <text font-family="Calibri-Bold, Calibri" font-size="17" font-weight="700" letter-spacing=".15em" transform="translate(466 133)">
                            <tspan x="0" y="0">${interNationalCarNumber || ''}</tspan>
                        </text>
                    </g>

                    <!-- Workshop Image -->
                    <img x="13" y="38" width="120" height="120" src="${config.backend_url} + (${data?.providerWorkShopId?.image} || '')" preserveAspectRatio="xMidYMid meet"/>

                    <!-- Footer Text -->
                    <text fill="#fff" data-name="Riyadh - old Industrial - ali st." font-family="Calibri-Bold, Calibri" font-size="12" font-weight="700" transform="translate(507 830)">
                        <tspan x="-72.36" y="0">${data?.providerWorkShopId?.address || ''}</tspan>
                    </text>
                    <text fill="#fff" data-name="966-5xxxxxxxx" font-family="Calibri-Bold, Calibri" font-size="12" font-weight="700" letter-spacing=".07em" transform="translate(279 830)">
                        <tspan x="-41.096" y="0">${data?.client?.contact || ''}</tspan>
                    </text>

                    <!-- Signature Icon -->
                    <g data-name="Group 55921">
                        <path fill="#fff" d="m352.708 826.662 1.637-1.637a.47.47 0 0 0 .082-.555l-1.053-1.962a.47.47 0 0 1 .01-.462l1.7-2.863a.47.47 0 0 1 .592-.191c.557.245 1.577.69 2.028.867a.6.6 0 0 1 .249.17c1.654 1.908-.361 5.7-3.267 8.609s-6.702 4.92-8.61 3.262a.6.6 0 0 1-.17-.244 78 78 0 0 0-.867-2.028.47.47 0 0 1 .191-.592l2.863-1.7a.47.47 0 0 1 .462-.01l1.962 1.055a.47.47 0 0 0 .555-.082Z" data-name="Path 28011"></path>
                        <path fill="#fff" d="M352.451 818.953v1.356a6.1 6.1 0 0 0-6.1 6.1H345a7.46 7.46 0 0 1 7.451-7.456" data-name="Path 28012"></path>
                        <path fill="#fff" d="M352.451 821.587v1.355a3.466 3.466 0 0 0-3.462 3.467h-1.355a4.82 4.82 0 0 1 4.817-4.822" data-name="Path 28013"></path>
                        <circle cx="6.608" cy="6.608" r="6.608" fill="#2ab540" data-name="Ellipse 3" transform="translate(328.858 819.285)"></circle>
                        <path fill="#fff" d="M331.227 825.854a4.25 4.25 0 0 0 .568 2.127l-.6 2.2 2.256-.592a4.25 4.25 0 0 0 2.034.518 4.256 4.256 0 1 0-4.258-4.253m1.344 2.016-.084-.134a3.537 3.537 0 1 1 3 1.657 3.54 3.54 0 0 1-1.8-.493l-.129-.077-1.339.351Zm2.912 2.242" data-name="Path 28009"></path>
                        <path fill="#fff" d="M334.42 824.079c-.08-.177-.163-.181-.239-.184s-.133 0-.2 0a.4.4 0 0 0-.284.133 1.2 1.2 0 0 0-.372.887 2.07 2.07 0 0 0 .434 1.1 4.37 4.37 0 0 0 1.816 1.605c.9.354 1.081.284 1.276.266a1.07 1.07 0 0 0 .718-.505.9.9 0 0 0 .062-.506c-.027-.044-.1-.071-.2-.124s-.629-.31-.727-.346-.168-.053-.239.053-.275.346-.337.417-.124.08-.23.027a2.9 2.9 0 0 1-.855-.528 3.2 3.2 0 0 1-.592-.736c-.062-.106-.007-.164.047-.217s.106-.124.16-.186a.7.7 0 0 0 .106-.177.2.2 0 0 0-.009-.186c-.027-.053-.233-.579-.328-.789" data-name="Path 28010"></path>
                    </g>

                    <!-- Barcode -->
                    <g fill="#fff" data-name="#ffffffff">
                        <path d="M154.356 34.581c.612.007 1.225 0 1.838 0-.006.61 0 1.219 0 1.828-.606 0-1.212.007-1.818 0-.031-.607-.006-1.218-.02-1.828" data-name="Path 28327"></path>
                        <path d="M141.536 38.249h1.826c.009.612 0 1.223 0 1.836-.612 0-1.224-.009-1.835 0 .009-.611 0-1.228.009-1.836" data-name="Path 28328"></path>
                        <path d="M172.681 38.251c.612-.008 1.224 0 1.836 0a62 62 0 0 0 0 1.834h-1.841c.006-.615.005-1.224.005-1.834" data-name="Path 28329"></path>
                        <path d="M137.874 41.906c.612.007 1.226 0 1.838 0-.017.613-.007 1.227-.006 1.84-.612-.012-1.222-.006-1.834 0 0 .61-.008 1.22 0 1.83-.612.006-1.222 0-1.834 0-.011-.612 0-1.223-.007-1.834.609 0 1.219-.005 1.829 0 .014-.607.001-1.221.014-1.836" data-name="Path 28330"></path>
                        <path d="M150.694 41.911h1.84c-.014.612-.005 1.223-.005 1.835h-1.832c-.007-.615 0-1.223-.003-1.835" data-name="Path 28331"></path>
                        <path d="M132.367 43.738c.613.012 1.227.007 1.841 0a80 80 0 0 0 0 1.836h-1.834c-.005-.612.001-1.224-.007-1.836" data-name="Path 28332"></path>
                        <path d="M134.206 45.575c.611.01 1.221 0 1.832 0v1.831h-1.836c.005-.611 0-1.221.004-1.831" data-name="Path 28333"></path>
                        <path d="M132.372 47.405c.611.007 1.221 0 1.832.006v1.83c-.612 0-1.223-.009-1.835.009.004-.616-.001-1.23.003-1.845" data-name="Path 28334"></path>
                        <path d="M141.531 54.734c.61.006 1.221.011 1.831-.007.007.614 0 1.228 0 1.842h-1.827c-.008-.612-.001-1.223-.004-1.835" data-name="Path 28335"></path>
                        <path d="M137.868 63.902c.612-.007 1.222.006 1.834-.008v1.84c-.611-.017-1.222.008-1.833-.015-.004-.605 0-1.211-.001-1.817" data-name="Path 28336"></path>
                        <path d="M187.334 78.551c1.831.014 3.661 0 5.492 0 .022 1.831 0 3.664.009 5.5-1.832-.006-3.665.014-5.5-.009 0-1.831.009-3.662 0-5.492m1.839 1.838v1.829c.61.005 1.221 0 1.831 0v-1.831l-1.832.003Z" data-name="Path 28337"></path>
                        <path d="M194.667 84.051h1.832v1.837c-.611-.007-1.221 0-1.831 0v1.831h-5.5v-1.834c1.832.008 3.664 0 5.5 0 0-.612.003-1.223-.001-1.834" data-name="Path 28338"></path>
                        <path d="M185.508 85.888h1.838c-.012.611 0 1.222-.008 1.833h-1.828c-.007-.613-.004-1.227-.002-1.833" data-name="Path 28339"></path>
                    </g>

                    <!-- QR Code -->
                    <img x="411" y="793" width="25" height="25" src="${config.backend_url} + (${data?.invoiceQRLink || ''})" preserveAspectRatio="xMidYMid meet"/>

                    <!-- Thank You Text -->
                    <text fill="#fff" data-name="Thank you for your visit and we are always at your service" font-family="Calibri" font-size="12" transform="translate(104 812)">
                        <tspan x="-67.588" y="0">Thank you for your visit and</tspan>
                        <tspan x="-71.089" y="15">we are always at your service</tspan>
                    </text>

                    <!-- Warranty English -->
                    <text data-name="(Warranty and maintenance terms)" font-family="Calibri" font-size="8" transform="translate(157 647)">
                        <tspan x="-57.055" y="0">(Warranty and maintenance terms)</tspan>
                    </text>
                </g>
            </g>
        </g>
    </svg>
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
          s && e ? (lang === 'ar' ? `من تاريخ ${fmtDate(s)} إلى ${fmtDate(e)}${dur ? ` ولمدة: ${dur} يوم` : ''}` : `From ${fmtDate(s)} to ${fmtDate(e)}${dur ? ` Duration: ${dur} days` : ''}`) : '';

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
          <tspan x="0" y="0">${lang === 'ar' ? 'تقرير صادر من تطبيق الصناعية' : 'Report issued by Senaeya App'}</tspan>
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
          <tspan x="-63.84" y="20">${lang === 'ar' ? 'عدد الفواتير المكتملة' : 'Number of completed invoices'}</tspan>
        </text>
        <text
          fill="#f90"
          data-name="Number of Postpaid invoices"
          font-family="Calibri-Bold, Calibri"
          font-size="16"
          font-weight="700"
          transform="translate(298 241)"
        >
          <tspan x="-57.301" y="20">${lang === 'ar' ? 'عدد الفواتير الآجلة' : 'Number of Postpaid invoices'}</tspan>
        </text>
        <text
          fill="#cb3c40"
          data-name="Number of saved invoices"
          font-family="Calibri-Bold, Calibri"
          font-size="16"
          font-weight="700"
          transform="translate(126 241)"
        >
          <tspan x="-47.555" y="20">${lang === 'ar' ? 'عدد الفواتير المحفوظة' : 'Number of saved invoices'}</tspan>
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
          <tspan x="-115.796" y="0">${lang === 'ar' ? 'مجموع الإيرادات المحصلة' : 'Total income collected'}</tspan>
        </text>
        <text
          fill="#fff"
          data-name="Total postpaid and saved income"
          font-family="Calibri-Bold, Calibri"
          font-size="22"
          font-weight="700"
          transform="translate(381 428)"
        >
          <tspan x="-149.021" y="0">${lang === 'ar' ? 'مجموع الإيرادات الآجلة والمحفوظة' : 'Total postpaid and saved income'}</tspan>
        </text>
        <text
          fill="#fff"
          data-name="Total expenses paid"
          font-family="Calibri-Bold, Calibri"
          font-size="25"
          font-weight="700"
          transform="translate(429 490)"
        >
          <tspan x="-101.404" y="0">${lang === 'ar' ? 'مجموع المصروفات المدفوعة' : 'Total expenses paid'}</tspan>
        </text>
        <text
          data-name="Number of cars serviced"
          font-family="Calibri-Bold, Calibri"
          font-size="22"
          font-weight="700"
          transform="translate(420 732)"
        >
          <tspan x="-110.317" y="0">${lang === 'ar' ? 'عدد السيارات التي تم خدمتها' : 'Number of cars serviced'}</tspan>
        </text>
        <text
          font-family="Calibri-Bold, Calibri"
          font-size="22"
          font-weight="700"
          transform="translate(96 732)"
        >
          <tspan x="-19.417" y="0">${lang === 'ar' ? 'سيـارة' : 'Cars'}</tspan>
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
          <tspan x="-110.591" y="0">${lang === 'ar' ? 'الميزان المالي المحصل' : 'Collected financial balance'}</tspan>
        </text>
        <text
          data-name="All income recorded"
          font-family="Calibri-Bold, Calibri"
          font-size="11"
          font-weight="700"
          transform="translate(429 596)"
        >
          <tspan x="-45.751" y="0">${lang === 'ar' ? 'جميع الإيرادات المسجلة' : 'All income recorded'}</tspan>
        </text>
        <text
          data-name="All income collected"
          font-family="Calibri-Bold, Calibri"
          font-size="11"
          font-weight="700"
          transform="translate(169 596)"
        >
          <tspan x="-45.861" y="0">${lang === 'ar' ? 'جميع الإيرادات المحصلة' : 'All income collected'}</tspan>
        </text>
        <text
          data-name="All expenses paid"
          font-family="Calibri-Bold, Calibri"
          font-size="11"
          font-weight="700"
          transform="translate(430 617)"
        >
          <tspan x="-39.529" y="0">${lang === 'ar' ? 'جميع المصروفات المدفوعة' : 'All expenses paid'}</tspan>
        </text>
        <text
          data-name="All expenses paid"
          font-family="Calibri-Bold, Calibri"
          font-size="11"
          font-weight="700"
          transform="translate(169 617)"
        >
          <tspan x="-39.529" y="0">${lang === 'ar' ? 'جميع المصروفات المدفوعة' : 'All expenses paid'}</tspan>
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
          <tspan x="0" y="0">{lang === 'ar' ? 'سجل تجاري' : 'CR'} - ${report.workshop.crn}</tspan>
        </text>
        <text
          fill="#fff"
          data-name=${report.workshop.taxVatNumber}
          font-family="ArialMT, Arial"
          font-size="10"
          transform="translate(50 87)"
        >
          <tspan x="0" y="0">{lang === 'ar' ? 'الرقم الضريبي' : 'VAT'} - ${report.workshop.taxVatNumber}</tspan>
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
            ${lang === 'ar' ? 'بإمكانك إصدار تقارير متعددة عبر تطبيق الصناعية' : 'You can issue multiple reports via Senaeya App'}
          </tspan>
          <tspan font-size="10">
            <tspan x="-106.143" y="15">
              ${lang === 'ar' ? 'تقرير يومي - أسبوعي - شهري - سنوي - وأكثر' : 'Daily - Weekly - Monthly - Annual Report - and more'}
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
     subscriptionDeleted,
     // resetPassword,
     // resetPasswordByUrl,
     // contactFormTemplate,
     // contact,
};
