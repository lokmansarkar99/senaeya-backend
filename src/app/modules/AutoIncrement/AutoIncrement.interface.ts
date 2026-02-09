export interface IAutoIncrement {
     key: string; // counter name (invoice, subscription, etc.)
     workshopId?: string; // optional workshop ID for workshop-specific counters
     value: number;
     createdAt: Date;
     updatedAt: Date;
}
