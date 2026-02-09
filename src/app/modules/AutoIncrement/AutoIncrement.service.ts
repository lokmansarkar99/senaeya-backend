import { AutoIncrement } from './AutoIncrement.model';

const increaseAutoIncrement = async (key: 'invoice' | 'subscription', session?: any, workshopId?: string) => {
     // For invoice, use workshop-specific counter if workshopId is provided
     // For subscription, use global counter (existing behavior)
     const query = key === 'invoice' && workshopId
          ? { key, workshopId }
          : { key };

     const counter = await AutoIncrement.findOneAndUpdate(
          query,
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
