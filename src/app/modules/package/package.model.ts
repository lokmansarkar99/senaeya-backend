import { model, Schema } from 'mongoose';
import { IPackage, PackageModel } from './package.interface';
import { PackageDuration, PackagePaymentType, PackageSubscriptionType, PackageStatus } from './package.enum';

const packageSchema = new Schema<IPackage, PackageModel>(
     {
          title: {
               type: String,
               required: true,
               unique: true,
          },
          description: {
               type: String,
               required: true,
          },
          features: {
               type: [String],
               required: true,
          },
          price: {
               type: Number,
               required: true,
          },
          cutOffprice: {
               type: Number,
          },
          monthlyBasePrice: {
               type: Number,
               required: true,
          },
          yearlyBasePrice: {
               type: Number,
               required: false,
          },
          duration: {
               type: String,
               enum: Object.values(PackageDuration),
               required: true,
          },
          paymentType: {
               type: String,
               enum: Object.values(PackagePaymentType),
               required: true,
          },
          subscriptionType: {
               type: String,
               enum: Object.values(PackageSubscriptionType),
               required: true,
          },
          status: {
               type: String,
               enum: Object.values(PackageStatus),
               default: PackageStatus.active,
          },
          isDeleted: {
               type: Boolean,
               default: false,
          },
          discountPercentage: {
               type: Number,
               default: 0,
          },
     },
     {
          timestamps: true,
     },
);

packageSchema.pre('save', function (next) {
     if (this.monthlyBasePrice) {
          this.yearlyBasePrice = this.monthlyBasePrice * 12;
     }
     // if (this.price) {
     //      this.cutOffprice = this.price + (this.price * this.discountPercentage) / 100;
     // }
     next();
});

export const Package = model<IPackage, PackageModel>('Package', packageSchema);
