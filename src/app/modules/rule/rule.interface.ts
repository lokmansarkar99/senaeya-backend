import { Model } from 'mongoose';

export type IRule = {
     content: string;
     type: 'privacy' | 'terms' | 'about' | 'appExplain' | 'support' | 'socialMedia';
     value: number;
     valuesTypes: 'allowedInvoicesCountForFreeUsers' | 'defaultVat';
     // allowedInvoicesCountForFreeUsers: number;
     // defaultVat: number;
     socialMedia?: {
          facebook: string;
          twitter: string;
          instagram: string;
          linkedin: string;
          whatsapp: string;
     };
};

export type RuleModel = Model<IRule, Record<string, unknown>>;
