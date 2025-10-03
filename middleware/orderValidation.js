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
          .label('Price'),

        size: Joi.string()
          .required()
          .label('Size'),

      color: Joi.array()
  .items(Joi.string())
  .optional()
  .label('Color'),


        flavor: Joi.string()
          .optional()
          .allow('', null)
          .label('Flavor'),

        discount: Joi.number()
          .min(0)
          .optional()
          .label('Discount'),
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

deliveryAddress: Joi.object({
  name: Joi.string().allow('').required().label('Name'),
  phone: Joi.string().allow('').required().label('Phone'),
  address_line1: Joi.string().allow('').required().label('Address Line 1'),
  address_line2: Joi.string().allow('').optional().label('Address Line 2'), // ✅ fix here
  city: Joi.string().required().label('City'),
  state: Joi.string().required().label('State'),
  country: Joi.string().required().label('Country'),
  pincode: Joi.string().required().label('Pincode'),
  address_type: Joi.string().allow('').optional().label('Address Type'),
  is_default: Joi.boolean().allow('').optional().label('Is Default')
}).required().label('Delivery Address')

});
