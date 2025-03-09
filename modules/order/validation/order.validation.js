import joi from 'joi';
import joiObjectid from 'joi-objectid';

// Add objectId validation to Joi
const ObjectId = joiObjectid(joi);

const createSchema = {
  body: joi.object({})
};


const updateSchema = {
  params: joi.object({
    id: ObjectId().required()
  }),
  body: joi.object({
    books: joi.array()
      .items(
        joi.object({
          quantity: joi.number().min(1).required(),
          book: ObjectId().required()
        })
      )
      .min(1)
      .messages({
        'array.min': 'At least one book is required in the order.'
      }),
    totalPrice: joi.forbidden(),
    status: joi.string().valid('pending', 'shipped', 'delivered', 'cancelled')
  })
}

const updateOrderStatusSchema = {
  params: joi.object({
    id: ObjectId().required()
  }),
  body: joi.object({
    status: joi.string().valid('pending', 'shipped', 'delivered', 'cancelled')
  })
}

const deleteSchema = {
  params: joi.object({
    id: ObjectId().required()
  }),
};


const getSchema = {
  query: joi.object({})
};

const getByIdSchema = joi.object({
  params: joi.object({
    id: ObjectId().required()
  })
});

const checkoutSchema = joi.object({
  params: joi.object({
    id: ObjectId().required()
  })
});
export default {
  createSchema,
  getSchema,
  getByIdSchema,
  deleteSchema,
  updateSchema,
  updateOrderStatusSchema,
  checkoutSchema
};