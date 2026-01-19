import { AutoIncrement } from './AutoIncrement.model';
import { IAutoIncrement } from './AutoIncrement.interface';
const increaseAutoIncrement = async (session?: any) => {
     let result;
     let getLastValue = { value: 0 } as { value: number };
     getLastValue = (await AutoIncrement.findOne().sort({ value: -1 })) as IAutoIncrement;
     if (session) {
          result = await AutoIncrement.create({ value: Number(getLastValue.value) + 1 }, { session });
     } else {
          result = await AutoIncrement.create({ value: Number(getLastValue.value) + 1 });
     }
     return result;
};

export const AutoIncrementService = {
     increaseAutoIncrement,
};
