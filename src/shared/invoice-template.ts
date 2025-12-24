import ejs from 'ejs';
import path from 'path';
import config from '../config';

const CLIENT_CAR_TYPE = {
     SAUDI: 'SAUDI',
     INTERNATIONAL: 'INTERNATIONAL',
} as const;

interface InvoiceData {
     _id: string;
     createdAt: string;
     paymentMethod: string;
     totalCostOfSparePartsExcludingTax: number;
     totalCostExcludingTax: number;
     finalDiscountInFlatAmount: number;
     taxAmount: number;
     invoiceQRLink: string;

     providerWorkShopId: {
          workshopNameArabic: string;
          workshopNameEnglish: string;
          crn: string;
          taxVatNumber: string;
          bankAccountNumber: string;
          contact: string;
          address: string;
          image: string;
     };

     client: {
          clientId: {
               name: string;
          };
     };

     car: {
          brand: {
               title: string;
               image: string;
          };
          model: {
               title: string;
          };
          year: string;
          carType: string;
          plateNumberForInternational?: string;
          plateNumberForSaudi?: {
               symbol: { image: string };
               numberEnglish: string;
               numberArabic: string;
               alphabetsCombinations: string[];
          };
     };

     worksList: Array<{
          work: {
               code: string;
               title: Record<string, string>;
          };
          quantity: number;
          cost: number;
          finalCost: number;
     }>;

     sparePartsList: Array<{
          code: string;
          itemName: string;
          quantity: number;
          cost: number;
          finalCost: number;
     }>;
}

type TranslatedFieldEnum = 'ar' | 'en';

// Helper functions
const formatDate = (dateString: string): string => {
     const date = new Date(dateString);
     return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
};

const getFullImageUrl = (imagePath: string): string => {
     const base_route = config.backend_url || 'http://10.10.7.103:7010';
     return imagePath ? `${base_route}${imagePath}` : '';
};

// Main function
const createInvoiceNew = async (data: InvoiceData, lang: TranslatedFieldEnum): Promise<string> => {
     try {
          // Format date
          const invoiceCreatedAtt = formatDate(data.createdAt);

          // Get image URLs
          const carBrandImage = getFullImageUrl(data.car.brand.image);
          const providerWorkShopImage = getFullImageUrl(data.providerWorkShopId.image);
          const invoiceQrLink = getFullImageUrl(data.invoiceQRLink);

          // Build car number components
          let interNationalCarNumberComponent = '<div></div>';
          let saudiCarPlateComponent = '<div></div>';

          if (data.car.carType === CLIENT_CAR_TYPE.INTERNATIONAL) {
               interNationalCarNumberComponent = `
        <div class="invoice-number-box">
          <div class="invoice-number">${data.car.plateNumberForInternational || ''}</div>
        </div>`;
          }

          if (data.car.carType === CLIENT_CAR_TYPE.SAUDI && data.car.plateNumberForSaudi) {
               const carSymbol = getFullImageUrl(data.car.plateNumberForSaudi?.symbol?.image || '');
               saudiCarPlateComponent = `
        <div class="stamps-box">
          <div class="stamp-row">
            <span class="stamp-label">${data.car.plateNumberForSaudi.alphabetsCombinations[0]}</span>
            <span class="stamp-value">${data.car.plateNumberForSaudi.numberArabic}</span>
          </div>
          <div class="stamp-row">
            <span class="stamp-label">${data.car.plateNumberForSaudi.alphabetsCombinations[1]}</span>
            <span class="stamp-value">${data.car.plateNumberForSaudi.numberEnglish}</span>
          </div>
          <div class="logo-section">
            <img src="${carSymbol}" class="logo" alt="Car Symbol">
          </div>
        </div>`;
          }

          // Prepare template data
          const templateData = {
               data,
               lang,
               invoiceCreatedAtt,
               carBrandImage,
               providerWorkShopImage,
               invoiceQrLink,
               interNationalCarNumberComponent,
               saudiCarPlateComponent,
          };

          // Render EJS template
          const templatePath = path.join(__dirname, 'invoice-template.ejs');
          const html = await ejs.renderFile(templatePath, templateData);

          return html;
     } catch (error) {
          console.error('Error creating invoice:', error);
          throw error;
     }
};

// Alternative: If you want to use a string template instead of file
const createInvoiceFromString = async (data: InvoiceData, lang: TranslatedFieldEnum, templateString: string): Promise<string> => {
     try {
          // Format date
          const invoiceCreatedAtt = formatDate(data.createdAt);

          // Get image URLs
          const carBrandImage = getFullImageUrl(data.car.brand.image);
          const providerWorkShopImage = getFullImageUrl(data.providerWorkShopId.image);
          const invoiceQrLink = getFullImageUrl(data.invoiceQRLink);

          // Build car number components
          let interNationalCarNumberComponent = '<div></div>';
          let saudiCarPlateComponent = '<div></div>';

          if (data.car.carType === CLIENT_CAR_TYPE.INTERNATIONAL) {
               interNationalCarNumberComponent = `
        <div class="invoice-number-box">
          <div class="invoice-number">${data.car.plateNumberForInternational || ''}</div>
        </div>`;
          }

          if (data.car.carType === CLIENT_CAR_TYPE.SAUDI && data.car.plateNumberForSaudi) {
               const carSymbol = getFullImageUrl(data.car.plateNumberForSaudi?.symbol?.image || '');
               saudiCarPlateComponent = `
        <div class="stamps-box">
          <div class="stamp-row">
            <span class="stamp-label">${data.car.plateNumberForSaudi.alphabetsCombinations[0]}</span>
            <span class="stamp-value">${data.car.plateNumberForSaudi.numberArabic}</span>
          </div>
          <div class="stamp-row">
            <span class="stamp-label">${data.car.plateNumberForSaudi.alphabetsCombinations[1]}</span>
            <span class="stamp-value">${data.car.plateNumberForSaudi.numberEnglish}</span>
          </div>
          <div class="logo-section">
            <img src="${carSymbol}" class="logo" alt="Car Symbol">
          </div>
        </div>`;
          }

          // Prepare template data
          const templateData = {
               data,
               lang,
               invoiceCreatedAtt,
               carBrandImage,
               providerWorkShopImage,
               invoiceQrLink,
               interNationalCarNumberComponent,
               saudiCarPlateComponent,
          };

          // Render EJS template from string
          const html = ejs.render(templateString, templateData);

          return html;
     } catch (error) {
          console.error('Error creating invoice:', error);
          throw error;
     }
};

export { createInvoiceNew, createInvoiceFromString };
