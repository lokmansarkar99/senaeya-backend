import express from 'express';
import { initiatePayment } from './clickpay.service';
import { CLICKPAY_CURRENCY } from './clickpay.interface';
import { TRAN_TYPE, TRAN_CLASS } from './clickpay.enum';
import sendResponse from '../../../../shared/sendResponse';

const router = express.Router();

router.post('/initiate', async (req, res) => {
     try {
          const { amount, orderId, description } = req.body; // From your frontend form

          const paymentRequest = {
               cart_amount: parseFloat(amount),
               cart_currency: CLICKPAY_CURRENCY,
               cart_description: description || 'Order Payment',
               cart_id: orderId,
               tran_type: TRAN_TYPE.SALE,
               tran_class: TRAN_CLASS.ECOM,
               callback: `${req.protocol}://${req.get('host')}/api/v1/clickpay/callback`, // Your callback URL
               return: `${req.protocol}://${req.get('host')}/api/v1/clickpay/success`, // Customer return URL
          };

          const result = await initiatePayment(paymentRequest);
          console.log('🚀 ~ result:', result);

          if (result && result.redirect_url) {
               // Redirect user to ClickPay's hosted page
               //   res.redirect(303, result.redirect_url);
               sendResponse(res, {
                    statusCode: 200,
                    success: true,
                    message: 'Payment initiation successful',
                    data: result,
               });
          } else if (result && result.transaction_status) {
               // Rare direct success
               res.json({ success: true, transactionId: result.payment_gateway_reference });
          } else {
               res.status(400).json({ error: 'Payment initiation failed' });
          }
     } catch (error: any) {
          res.status(500).json({ error: error.message });
     }
});

router.post('/callback', (req, res) => {
     const { transaction_status, payment_gateway_reference, cart_id } = req.body;

     // Verify the callback (ClickPay may provide a signature; check docs for validation)
     console.log(`Payment Callback: Order ${cart_id} - Status: ${transaction_status}, Ref: ${payment_gateway_reference}`);

     // Update your database: e.g., mark order as paid if status === 'success'
     // Example: await updateOrderStatus(cart_id, transaction_status);

     // Always respond with 200/201 to acknowledge
     res.status(200).send('OK');
});

// make a success route with html return
router.get('/success', (req, res) => {
     res.send('<h1>Payment successful</h1>');
});

export const clickpayRoutes = router;
