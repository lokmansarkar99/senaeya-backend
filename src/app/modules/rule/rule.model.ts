import { model, Schema } from 'mongoose';
import { IRule, RuleModel } from './rule.interface';

const ruleSchema = new Schema<IRule, RuleModel>({
     content: {
          type: String,
          required: true,
     },
     type: {
          type: String,
          enum: ['privacy', 'terms', 'about', 'appExplain', 'support'],
          select: 0,
     },
     value: {
          type: Number,
          required: true,
     },
     valuesTypes: {
          type: String,
          enum: ['allowedInvoicesCountForFreeUsers', 'defaultVat'],
          required: true,
     },
});

export const Rule = model<IRule, RuleModel>('Rule', ruleSchema);
