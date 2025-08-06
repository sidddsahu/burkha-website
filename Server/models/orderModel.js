


const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderItems: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      productName: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
      },
      price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
      },
      quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
      },
      productImage: {
        type: String,
        default: ''
      },
      discountName: {
        _id: mongoose.Schema.Types.ObjectId,
        firmName: String,
        contactName: String,
        contactType: String,
        mobile1: String,
        mobile2: String,
        whatsapp: String,
        email: String,
        state: String,
        city: String,
        address: String,
        discount: Number,
        limit:Number,
        createdAt: Date,
        updatedAt: Date
      },
      discountPercentage: {
        type: Number,
        min: [0, 'Discount percentage cannot be negative'],
        max: [100, 'Discount percentage cannot exceed 100']
      },
      priceAfterDiscount: {
        type: Number,
        min: [0, 'Discounted price cannot be negative'],
        validate: {
          validator: function(value) {
            return value <= this.price;
          },
          message: 'Discounted price cannot be higher than original price'
        }
      }
    }
  ],

  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  totalPriceAfterDiscount: {
    type: Number,
    required: [true, 'Total price after discount is required'],
    min: [0, 'Total price after discount cannot be negative'],
    validate: {
      validator: function(value) {
        return value <= this.totalPrice;
      },
      message: 'Discounted total cannot be higher than original total'
    }
  },
  dueAmount: {
    type: Number,
    default: function() {
      return this.totalPriceAfterDiscount || this.totalPrice;
    },
    min: [0, 'Due amount cannot be negative']
  },

  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration'
  },

  receivedBy: {
    type: String,
    trim: true
  },
  remark: {
    type: String,
    trim: true
  },
  deliveredAt: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value <= new Date();
      },
      message: 'Delivery date cannot be in the future'
    }
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'partially_paid', 'paid'],
    default: 'pending'
  },
  payments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    }
  ],

  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },

  shippingAddress: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String
  },

  cancellationReason: {
    type: String,
    trim: true
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
orderSchema.index({ vendor: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual ID formatter
orderSchema.virtual('formattedId').get(function () {
  return this._id.toString().slice(-6).toUpperCase();
});

module.exports = mongoose.model('Order', orderSchema);
