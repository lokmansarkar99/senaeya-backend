import { z } from 'zod';

const createExpenseZodSchema = z.object({
     body: z.object({
          providerWorkShopId: z.string({ required_error: 'Workshop ID is required' }),
          title: z.string({ required_error: 'Title is required' }),
          amount: z.number({ required_error: 'Amount is required' }),
          spendingDate: z.string({ required_error: 'Spending date is required' }),
          description: z.string().optional(),
     }),
});

const updateExpenseZodSchema = z.object({
     body: z.object({
          providerWorkShopId: z.string().optional(),
          title: z.string().optional(),
          amount: z.number().optional(),
          spendingDate: z.date().optional(),
          description: z.string().optional(),
     }),
});

const getMonthlyYearlyExpensesZodSchema = z.object({
     query: z.object({
          year: z.string().optional(),
          month: z.string().optional(),
     }),
});

export const expenseValidation = {
     createExpenseZodSchema,
     updateExpenseZodSchema,
     getMonthlyYearlyExpensesZodSchema,
};
