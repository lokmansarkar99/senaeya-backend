import { model, Schema } from 'mongoose';
import { IRule, RuleModel } from './rule.interface';

const ruleSchema = new Schema<IRule, RuleModel>({
     content: {
          type: String,
          required: function (this: IRule) {
               return ['privacy', 'terms', 'about', 'appExplain', 'support'].includes(this.type);
          },
     },
     type: {
          type: String,
          enum: ['privacy', 'terms', 'about', 'appExplain', 'support', 'socialMedia'],
          select: 0,
     },
     value: {
          type: Number,
          required: function (this: IRule) {
               return ['allowedInvoicesCountForFreeUsers', 'defaultVat'].includes(this.valuesTypes);
          },
     },
     valuesTypes: {
          type: String,
          enum: ['allowedInvoicesCountForFreeUsers', 'defaultVat'],
          select: 0,
     },
     socialMedia: {
          type: {
               facebook: String,
               twitter: String,
               instagram: String,
               linkedin: String,
               whatsapp: String,
          },
          select: false,
     },
});

export const Rule = model<IRule, RuleModel>('Rule', ruleSchema);
