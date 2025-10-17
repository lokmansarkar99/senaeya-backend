import express from 'express';
import { expenseController } from './expense.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { expenseValidation } from './expense.validation';
import { USER_ROLES } from '../../../enums/user';
import validateUserAuthority from '../../middleware/validateUserAuthority';

const router = express.Router();

router.post('/', auth(USER_ROLES.WORKSHOP_OWNER, USER_ROLES.WORKSHOP_MEMBER), validateRequest(expenseValidation.createExpenseZodSchema), validateUserAuthority(), expenseController.createExpense);

router.get('/', auth(USER_ROLES.WORKSHOP_OWNER, USER_ROLES.WORKSHOP_MEMBER), validateUserAuthority(), expenseController.getAllExpenses);

router.get('/monthly-yearly-expenses', auth(USER_ROLES.WORKSHOP_OWNER, USER_ROLES.WORKSHOP_MEMBER), validateUserAuthority(), validateRequest(expenseValidation.getMonthlyYearlyExpensesZodSchema), expenseController.getMonthlyYearlyExpenses);

router.get('/unpaginated', auth(USER_ROLES.WORKSHOP_OWNER, USER_ROLES.WORKSHOP_MEMBER), validateUserAuthority(), expenseController.getAllUnpaginatedExpenses);

router.delete('/hard-delete/:id', auth(USER_ROLES.WORKSHOP_OWNER, USER_ROLES.WORKSHOP_MEMBER), validateUserAuthority(), expenseController.hardDeleteExpense);

router.patch('/:id', auth(USER_ROLES.WORKSHOP_OWNER, USER_ROLES.WORKSHOP_MEMBER), validateRequest(expenseValidation.updateExpenseZodSchema), validateUserAuthority(), expenseController.updateExpense);

router.delete('/:id', auth(USER_ROLES.WORKSHOP_OWNER, USER_ROLES.WORKSHOP_MEMBER), validateUserAuthority(), expenseController.deleteExpense);

router.get('/:id', auth(USER_ROLES.WORKSHOP_OWNER, USER_ROLES.WORKSHOP_MEMBER), validateUserAuthority(), expenseController.getExpenseById);

export const expenseRoutes = router;
