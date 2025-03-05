import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

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
      validate: {
        validator(v) {
          return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-z]{2,7}$/i.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`
      }
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
      type: String
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  {
    timestamps: true,
    toObject: {virtuals: true} // Add this
  }
);

userSchema.index({email: 1});
userSchema.index({username: 1});

userSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 8);
  next();
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

// Virtual populate for cart
userSchema.virtual('cart', {
  ref: 'Cart',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
  match: {status: 'active'}
});

// Middleware to automatically populate cart
userSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'cart',
    populate: {
      path: 'items.book',
      model: 'Book'
    }
  }).select('-user');
  next();
});
export default userSchema;
