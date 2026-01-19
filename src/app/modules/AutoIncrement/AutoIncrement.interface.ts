export interface IAutoIncrement {
     key: string; // counter name (invoice, subscription, etc.)
     value: number;
     createdAt: Date;
     updatedAt: Date;
}
