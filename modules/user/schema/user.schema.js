import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import emailTemplate from '../../../middlewares/email/email.template.js';
import sendEmail from '../../../middlewares/email/send.email.js';
import CartModel from '../../cart/model/cart.model.js';

const userSchema = new mongoose.Schema(
  {
    // Basic user information
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isEmailVerfied: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },

    phoneNumber: {
      type: String,
      trim: true
    },

    avatar: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  {
    timestamps: true,
    toObject: { virtuals: true } // Add this
  }
);

// userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

userSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 8);
  await CartModel.create({ user: this._id, status: 'active', items: [] });
  next();
});

userSchema.post('save', async (doc, _) => {
  sendEmail(
    doc.email,
    'Welcome to our platform',
    emailTemplate
  );
});


userSchema.methods.verifyPassword = async function (password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.toJSON = function () {
  const employee = this.toObject();
  delete employee.__v;
  delete employee.password;
  return employee;
};

// Add a virtual field to your user schema
userSchema.virtual('cart', {
  ref: 'Cart',
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

userSchema.post("save", (doc) => {
  console.log("this is the document : ", doc);
})

// Middleware to automatically populate cart
userSchema.pre('findOne', async function (next) {
  this.populate({
    path: 'cart',
    populate: {
      path: 'items',
      populate: {
        path: 'book', // Populate the book field within each item
        model: 'Book'
      }
    }
  });
  next();
});


export default userSchema;
