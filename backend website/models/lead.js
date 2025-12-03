const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  propertyType: {
    type: String,
    enum: ['plot', 'flat', null],
    default: null
  },
  location: {
    type: String,
    enum: ['najafgarh', 'dwarka', null],
    default: null
  },
  budget: {
    min: Number,
    max: Number
  },
  message: String,
  source: {
    type: String,
    enum: ['website_form', 'phone_call', 'walk_in', 'referral'],
    default: 'website_form'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'interested', 'not_interested', 'converted'],
    default: 'new'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: [{
    note: String,
    createdBy: mongoose.Schema.Types.ObjectId,
    createdAt: { type: Date, default: Date.now }
  }],
  followUpDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lead', leadSchema);
