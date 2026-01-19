import { AutoIncrement } from './AutoIncrement.model';

const increaseAutoIncrement = async (key: 'invoice' | 'subscription', session?: any) => {
     const counter = await AutoIncrement.findOneAndUpdate(
          { key },
          { $inc: { value: 1 } }, // ✅ ATOMIC
          {
               new: true,
               upsert: true, // create if not exists
               session,
          },
     );

     return counter; // counter.value is SAFE
};

export const AutoIncrementService = {
     increaseAutoIncrement,
};
