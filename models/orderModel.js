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
      color:{
         type: Number,
        required: true
      },
       flavor: {
        type: String,
        trim: true
    },
    }
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
    type: String
  },
    paymentId: {
    type: String,
    default: null },// default for clarity  },
  deliveryAddress: {
    type: String,
    required: true
  }
}, { timestamps: true });

const orderModel = mongoose.model('Order', orderSchema);
export default orderModel;

