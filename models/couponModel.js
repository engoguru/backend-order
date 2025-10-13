import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minCartValue: { type: Number, default: 0 },
  expiryDate: { type: Date, required: true },

allowedUsers: [{ type: String }], // Store user IDs as strings
usedBy: [{ type: String }]

});


const couponModel=mongoose.model("Coupon",couponSchema);
export default couponModel