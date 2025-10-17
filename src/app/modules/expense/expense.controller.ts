import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { expenseService } from './expense.service';

const createExpense = catchAsync(async (req: Request, res: Response) => {
     const result = await expenseService.createExpense(req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Expense created successfully',
          data: result,
     });
});

const getAllExpenses = catchAsync(async (req: Request, res: Response) => {
     const result = await expenseService.getAllExpenses(req.query);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Expenses retrieved successfully',
          data: result,
     });
});

const getAllUnpaginatedExpenses = catchAsync(async (req: Request, res: Response) => {
     const result = await expenseService.getAllUnpaginatedExpenses();

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Expenses retrieved successfully',
          data: result,
     });
});

const updateExpense = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await expenseService.updateExpense(id, req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Expense updated successfully',
          data: result || undefined,
     });
});

const deleteExpense = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await expenseService.deleteExpense(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Expense deleted successfully',
          data: result || undefined,
     });
});

const hardDeleteExpense = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await expenseService.hardDeleteExpense(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Expense deleted successfully',
          data: result || undefined,
     });
});

const getExpenseById = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await expenseService.getExpenseById(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Expense retrieved successfully',
          data: result || undefined,
     });
});

const getMonthlyYearlyExpenses = catchAsync(async (req: Request, res: Response) => {
     const result = await expenseService.getMonthlyYearlyExpenses(req.query,req.body.providerWorkShopId);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Expenses retrieved successfully',
          data: result,
     });
});

export const expenseController = {
     createExpense,
     getAllExpenses,
     getAllUnpaginatedExpenses,
     updateExpense,
     deleteExpense,
     hardDeleteExpense,
     getExpenseById,
     getMonthlyYearlyExpenses,
};
