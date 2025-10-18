import axios, { AxiosResponse } from 'axios';
import { ClickPayPaymentRequest, ClickPayPaymentResponse } from './clickpay.interface';
import config from '../../../../config';

// Determine auth scheme: 'Bearer' (default) or 'Raw'

export async function initiatePaymentService(request: ClickPayPaymentRequest) {
     // Never log server keys in production
     try {
          const profileIdNum = Number(config.clickpay.profileId);

          const headers: Record<string, string> = {
               'Content-Type': 'application/json',
               'Authorization':  String(config.clickpay.serverKey),
          };

          const payload = {
               ...request,
               profile_id: profileIdNum, // ensure numeric
          };

          const response: AxiosResponse = await axios.post(
               `${config.clickpay.apiEndpoint}/payment/request`,
               payload,
               {
                    headers,
               },
          );

          if (response.status >= 200 && response.status < 300) {
               const data = response.data as ClickPayPaymentResponse & { redirect_url?: string };
               if (data?.transaction_status) {
                    return data;
               } else if ((response.data as any)?.redirect_url) {
                    return { ...data, redirect_url: (response.data as any).redirect_url };
               }
          }
          throw new Error('Unexpected response from ClickPay');
     } catch (error: any) {
          console.log("🚀 ~ initiatePayment ~ error:", error)
          const apiMsg = error?.response?.data?.message || error?.message || 'Unknown error';
          const code = error?.response?.status;
          const trace = error?.response?.data?.trace;
          console.error('ClickPay Error:', { status: code, message: apiMsg, trace });
          throw new Error(`Payment initiation failed: ${apiMsg}`);
     }
}
