import Joi from 'joi';

export const orderValidationSchema = Joi.object({
  userId: Joi.string()
    .required()
    .label('User ID'),

  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string()
          .required()
          .label('Product ID'),

        quantity: Joi.number()
          .integer()
          .min(1)
          .required()
          .label('Quantity'),

        price: Joi.number()
          .positive()
          .precision(2)
          .required()
          .label('Price')
        ,
        size: Joi.string()
          .required()
          .label('Size'),
      
      })

    )
    .min(1)
    .required()
    .label('Items'),

  totalPrice: Joi.number()
    .positive()
    .precision(2)
    .required()
    .label('Total Price'),

  orderStatus: Joi.string()
    .valid('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled')
    .required()
    .label('Order Status'),

  paymentMethod: Joi.string()
    .valid('COD', 'Online')
    .required()
    .label('Payment Method'),

  paymentStatus: Joi.string()
    .valid('Pending', 'Paid', 'Failed')
    .required()
    .label('Payment Status'),

  paymentId: Joi.string()
    .allow(null, '')
    .optional()
    .label('Payment ID'),

  deliveryAddress: Joi.string()
    .min(5)
    .required()
    .label('Delivery Address')
});
