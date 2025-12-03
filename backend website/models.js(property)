const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Property description is required']
  },
  propertyType: {
    type: String,
    enum: ['plot', 'flat', 'house', 'commercial'],
    required: true
  },
  location: {
    area: { type: String, required: true },
    city: { type: String, default: 'Delhi' },
    landmark: String,
    fullAddress: String
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  priceUnit: {
    type: String,
    default: 'INR'
  },
  size: {
    value: Number,
    unit: { type: String, default: 'sqft' }
  },
  bedrooms: {
    type: Number,
    min: 0
  },
  bathrooms: {
    type: Number,
    min: 0
  },
  features: [String],
  amenities: [String],
  images: [String],
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved', 'under_construction'],
    default: 'available'
  },
  youtubeLink: String,
  virtualTourLink: String,
  contactPerson: {
    name: String,
    phone: String,
    email: String
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

propertySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Property', propertySchema);
