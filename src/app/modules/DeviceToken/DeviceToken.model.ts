import mongoose from "mongoose";
import { IDeviceToken } from "./DeviceToken.interface";

const deviceTokenSchema = new mongoose.Schema<IDeviceToken>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fcmToken: {
      type: String,
      required: true,
      trim: true,
    },
    deviceType: {
      type: String,
      enum: ['ios', 'android', 'web'],
      default: 'android',
    },
    deviceId: {
      type: String,
      required: true,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);
 
// Add unique compound index to prevent duplicate devices for a user
deviceTokenSchema.index({ userId: 1, deviceId: 1 }, { unique: true });
 
// Add index for faster lookups
deviceTokenSchema.index({ fcmToken: 1 });
 
const DeviceToken = mongoose.model<IDeviceToken>('DeviceToken', deviceTokenSchema);
 
export default DeviceToken;