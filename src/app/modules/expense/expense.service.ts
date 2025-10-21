import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { Iexpense } from './expense.interface';
import { Expense } from './expense.model';
import QueryBuilder from '../../builder/QueryBuilder';
import unlinkFile from '../../../shared/unlinkFile';
import { convertToDate } from './expense.utils';
import { buildTranslatedField } from '../../../utils/buildTranslatedField';

const createExpense = async (payload: Iexpense): Promise<Iexpense> => {
     // Translate multiple properties dynamically
    const [titleObj] : [Iexpense['title']]  = await Promise.all([
      buildTranslatedField(payload.title as any)
    ]);
    payload.title = titleObj;
     const formattedDate = convertToDate(payload.spendingDate as unknown as string);
     payload.spendingDate = formattedDate;
     const result = await Expense.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Expense not found.');
     }
     return result;
};

const getAllExpenses = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: Iexpense[] }> => {
     const queryBuilder = new QueryBuilder(Expense.find(), query);
     const result = await queryBuilder.filter().search(['item', 'description']).sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedExpenses = async (): Promise<Iexpense[]> => {
     const result = await Expense.find();
     return result;
};

const updateExpense = async (id: string, payload: Partial<Iexpense>): Promise<Iexpense | null> => {
     const isExist = await Expense.findById(id);
     if (!isExist) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Expense not found.');
     }

     return await Expense.findByIdAndUpdate(id, payload, { new: true });
};

const deleteExpense = async (id: string): Promise<Iexpense | null> => {
     const result = await Expense.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Expense not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteExpense = async (id: string): Promise<Iexpense | null> => {
     const result = await Expense.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Expense not found.');
     }
     return result;
};

const getExpenseById = async (id: string): Promise<Iexpense | null> => {
     const result = await Expense.findById(id);
     return result;
};

const getMonthlyYearlyExpenses = async (query: Record<string, any>, providerWorkShopId: string): Promise<{ meta: { total: number; page: number; limit: number }; result: Iexpense[] }> => {
     const { year, month } = query;
     console.log("🚀 ~ getMonthlyYearlyExpenses ~ query:", query)

     // Determine target year/month, defaulting to current if not provided/invalid
     const now = new Date();
     const parsedYear = Number(year);
     const validYear = Number.isInteger(parsedYear) ? parsedYear : now.getFullYear();

     const parsedMonth = Number(month);
     const hasValidMonth = Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12;

     // Build date range [start, end]
     let start: Date;
     let end: Date;
     if (hasValidMonth) {
          // JS Date month is 0-indexed
          const m = parsedMonth - 1;
          start = new Date(validYear, m, 1, 0, 0, 0, 0);
          // end: last millisecond of the month
          end = new Date(validYear, m + 1, 0, 23, 59, 59, 999);
     } else {
          // Whole year
          start = new Date(validYear, 0, 1, 0, 0, 0, 0);
          end = new Date(validYear, 11, 31, 23, 59, 59, 999);
     }

     const baseFilter: Record<string, any> = {
          providerWorkShopId,
          spendingDate: { $gte: start, $lte: end },
     };

     // Clone query and remove non-model params to avoid QueryBuilder trying to filter by them
     const qbQuery: Record<string, any> = { ...query };
     delete qbQuery.year;
     delete qbQuery.month;

     const queryBuilder = new QueryBuilder(Expense.find(baseFilter), qbQuery);
     const result = await queryBuilder.filter().search(['item', 'description']).sort().paginate().fields().modelQuery;

     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

export const expenseService = {
     createExpense,
     getAllExpenses,
     getAllUnpaginatedExpenses,
     updateExpense,
     deleteExpense,
     hardDeleteExpense,
     getExpenseById,
     getMonthlyYearlyExpenses,
};
