import express from 'express';
import { UserRouter } from '../app/modules/user/user.route';
import { AuthRouter } from '../app/modules/auth/auth.route';
import SettingsRouter from '../app/modules/settings/settings.route';
import { messageRoutes } from '../app/modules/message/message.route';
import { workShopRoutes } from '../app/modules/workShop/workShop.route';
import { carBrandRoutes } from '../app/modules/carBrand/carBrand.route';
import { imageRoutes } from '../app/modules/image/image.route';
import { clientRoutes } from '../app/modules/client/client.route';
import { carRoutes } from '../app/modules/car/car.route';
import { worksCategoriesRoutes } from '../app/modules/worksCategories/worksCategories.route';
import { carBrandCountriesRoutes } from '../app/modules/carBrandCountries/carBrandCountries.route';
import { workRoutes } from '../app/modules/work/work.route';
import { expenseRoutes } from '../app/modules/expense/expense.route';
import { invoiceRoutes } from '../app/modules/invoice/invoice.route';
import { paymentRoutes } from '../app/modules/payment/payment.route';
import { reportRoutes } from '../app/modules/report/report.route';
import { clickpayRoutes } from '../app/modules/payment/clickpay/clickpay.route';
const router = express.Router();
const routes = [
     {
          path: '/auth',
          route: AuthRouter,
     },
     {
          path: '/users',
          route: UserRouter,
     },
     {
          path: '/settings',
          route: SettingsRouter,
     },
     {
          path: '/message',
          route: messageRoutes,
     },
     {
          path: '/workshops',
          route: workShopRoutes,
     },
     {
          path: '/car-brands',
          route: carBrandRoutes,
     },
     {
          path: '/images',
          route: imageRoutes,
     },
     {
          path: '/clients',
          route: clientRoutes,
     },
     {
          path: '/cars',
          route: carRoutes,
     },
     {
          path: '/works-categories',
          route: worksCategoriesRoutes,
     },
     {
          path: '/car-brand-countries',
          route: carBrandCountriesRoutes,
     },
     {
          path: '/works',
          route: workRoutes,
     },
     {
          path: '/expenses',
          route: expenseRoutes,
     },
     {
          path: '/invoices',
          route: invoiceRoutes,
     },
     {
          path: '/payments',
          route: paymentRoutes,
     },
     {
          path: '/reports',
          route: reportRoutes,
     },
     {
          path: '/clickpay',
          route: clickpayRoutes,
     }    
];

routes.forEach((element) => {
     if (element?.path && element?.route) {
          router.use(element?.path, element?.route);
     }
});

export default router;
