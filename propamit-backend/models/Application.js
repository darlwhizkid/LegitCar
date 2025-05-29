const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  applicationNumber: {
    type: String,
    unique: true,
    required: true
  },
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: [
      'vehicle-registration',
      'document-renewal',
      'ownership-transfer',
      'drivers-license',
      'vehicle-accessories',
      'maritime-registration',
      'aviation-documentation'
    ]
  },
  vehicleDetails: {
    make: String,
    model: String,
    year: Number,
    color: String,
    engineNumber: String,
    chassisNumber: String,
    plateNumber: String,
    vehicleType: {
      type: String,
      enum: ['car', 'motorcycle', 'truck', 'bus', 'trailer', 'boat', 'aircraft']
    }
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'in-review', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  estimatedCompletionDate: Date,
  actualCompletionDate: Date,
  fees: {
    serviceFee: {
      type: Number,
      default: 0
    },
    governmentFee: {
      type: Number,
      default: 0
    },
    totalFee: {
      type: Number,
      default: 0
    },
    paid: {
      type: Boolean,
      default: false
    },
    paymentDate: Date,
    paymentReference: String
  },
  notes: [{
    message: String,
    addedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignedAgent: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Generate application number
applicationSchema.pre('save', async function(next) {
  if (!this.applicationNumber) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.applicationNumber = `PROP${year}${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Calculate total fee
applicationSchema.pre('save', function(next) {
  this.fees.totalFee = this.fees.serviceFee + this.fees.governmentFee;
  next();
});

module.exports = mongoose.model('Application', applicationSchema);