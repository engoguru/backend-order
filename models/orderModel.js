import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  items: [
    {
      productId: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      size: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      color: {
        type: [String], // change from String to Array of Strings
        trim: true
      },
      flavor: {
        type: String,
        trim: true
      },
      discount: {
        type: Number,
        default: 0
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['COD', 'Online']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['Pending', 'Paid', 'Failed']
  },

  paymentId: {
    type: String,
    default: null
  },// default for clarity  },
deliveryAddress: {
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address_line1: { type: String, required: true },
  address_line2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  pincode: { type: String, required: true },
  address_type: { type: String },
  is_default: { type: Boolean }
}

}, { timestamps: true });

const orderModel = mongoose.model('Order', orderSchema);
export default orderModel;

