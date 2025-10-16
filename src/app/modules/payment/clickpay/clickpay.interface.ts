import { TRAN_TYPE, TRAN_CLASS } from './clickpay.enum';

export interface ClickPayPaymentRequest {
     profile_id?: string;
     cart_amount: number;
     cart_currency: string; // e.g., 'SAR'
     cart_description: string;
     cart_id: string; // Unique order ID from your app
     callback?: string; // Server-to-server notification URL (optional but recommended)
     return?: string; // Customer redirect back to your site after payment (optional)
     tran_type: TRAN_TYPE;
     tran_class: TRAN_CLASS;
     // Add other optional fields as needed, e.g., customer details
}

export interface ClickPayPaymentResponse {
     // Success/Redirect/Error response structure (varies)
     transaction_status?: string;
     payment_gateway_reference?: string;
     redirect_url?: string;
     // Full response parsing will be handled in code
}

export const CLICKPAY_CURRENCY = 'SAR'; // Saudi Riyal, adjust if needed
