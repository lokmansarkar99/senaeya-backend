module.exports = {
    API_BASE: 'https://secure.clickpay.com.sa/payment',
    ENDPOINTS: {
        REQUEST: '/request',
        QUERY: '/query',
        TOKEN: '/token',
        TOKEN_DELETE: '/token/delete'
    },
    TRAN_TYPE: 'sale',  // Or 'auth' etc.
    TRAN_CLASS: 'ecom', // Or 'moto', 'cont'
    DEFAULT_CURRENCY: process.env.CLICKPAY_CURRENCY || 'SAR'
};