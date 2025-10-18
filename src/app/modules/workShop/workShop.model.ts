import { Schema, model, Types } from 'mongoose';
import { IworkShop, IWorkingSubSchedule } from './workShop.interface';
import { MAX_FREE_INVOICE_COUNT } from './workshop.enum';

const DaysOfWeek = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

// Sub-schema for working schedule
const WorkingSubScheduleSchema = new Schema<IWorkingSubSchedule>(
     {
          startDay: { type: String, enum: DaysOfWeek, required: true },
          endDay: { type: String, enum: DaysOfWeek, required: true },
          startTime: { type: String, required: true },
          endTime: { type: String, required: true },
     },
     { _id: false },
);

const WorkShopSchema = new Schema<IworkShop>(
     {
          workshopNameEnglish: { type: String, required: true, trim: true },
          workshopNameArabic: { type: String, required: true, trim: true },
          unn: {
               type: String,
               required: true,
               // unified national number | total digit: 10; startingWith: 7
               match: [/^7\d{9}$/i, 'unn must be 10 digits starting with 7'],
               trim: true,
          },
          crn: {
               type: String,
               required: true,
               // commercial registration number | total digit: 10
               match: [/^\d{10}$/i, 'crn must be exactly 10 digits'],
               trim: true,
          },
          mln: {
               type: String,
               required: true,
               unique: true,
               // municipality license number | unique | total digit: 11; startingWith: 4
               match: [/^4\d{10}$/i, 'mln must be 11 digits starting with 4'],
               trim: true,
          },
          address: { type: String, required: true, trim: true },
          taxVatNumber: {
               type: String,
               required: true,
               // total digit: 15; startingWith: 3
               match: [/^3\d{14}$/i, 'taxVatNumber must be 15 digits starting with 3'],
               trim: true,
          },
          bankAccountNumber: {
               type: String,
               required: false,
               // total letters: 24; startingWith: "SA"
               match: [/^SA[A-Z0-9]{22}$/i, 'bankAccountNumber must be 24 characters starting with SA'],
               trim: true,
          },
          isAvailableMobileWorkshop: { type: Boolean, required: true },
          workshopGEOlocation: {
               type: {
                    type: String,
                    enum: ['Point'],
                    default: 'Point',
                    required: true,
               },
               coordinates: {
                    type: [Number],
                    required: true,
                    validate: {
                         validator: (val: number[]) => Array.isArray(val) && val.length === 2,
                         message: 'coordinates must be an array of [longitude, latitude] of length 2',
                    },
               },
          } as any, // GeoJSON
          regularWorkingSchedule: { type: WorkingSubScheduleSchema, required: true },
          ramadanWorkingSchedule: { type: WorkingSubScheduleSchema, required: true },
          image: { type: String, required: false },
          ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
          helperUserId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
          description: { type: String, required: false },
          isDeleted: { type: Boolean, default: false },
          deletedAt: { type: Date },
          generatedInvoiceCount: { type: Number, default: 0,max: MAX_FREE_INVOICE_COUNT },
          subscribedPackage: {
               type: Types.ObjectId,
               ref: 'Package',
               default: null,
          },
          subscriptionId: {
               type: Types.ObjectId,
               ref: 'Subscription',
               default: null,
          },
          isUsedTrial:{
               type: Boolean,
               default: true,
          }
     },
     { timestamps: true },
);

// 2dsphere index for geo queries
WorkShopSchema.index({ workshopGEOlocation: '2dsphere' });

WorkShopSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

WorkShopSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

WorkShopSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const WorkShop = model<IworkShop>('WorkShop', WorkShopSchema);
