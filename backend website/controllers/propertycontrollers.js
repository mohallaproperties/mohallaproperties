const Property = require('../models/Property');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/properties/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
}).array('images', 10); // Max 10 images

// Upload property images
exports.uploadImages = (req, res, next) => {
  upload(req, res, function(err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// Create property
exports.createProperty = async (req, res) => {
  try {
    const imagePaths = req.files ? req.files.map(file => file.path) : [];
    
    const propertyData = {
      ...req.body,
      images: imagePaths,
      price: parseFloat(req.body.price),
      size: {
        value: parseFloat(req.body.sizeValue),
        unit: req.body.sizeUnit || 'sqft'
      },
      bedrooms: parseInt(req.body.bedrooms) || 0,
      bathrooms: parseInt(req.body.bathrooms) || 0
    };

    const property = new Property(propertyData);
    await property.save();
    
    res.status(201).json({
      success: true,
      data: property,
      message: 'Property created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all properties
exports.getAllProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      location,
      minPrice,
      maxPrice,
      bedrooms,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { status: 'available' };
    
    if (type) query.propertyType = type;
    if (location) query['location.area'] = location;
    if (minPrice) query.price = { $gte: parseFloat(minPrice) };
    if (maxPrice) {
      if (query.price) {
        query.price.$lte = parseFloat(maxPrice);
      } else {
        query.price = { $lte: parseFloat(maxPrice) };
      }
    }
    if (bedrooms) query.bedrooms = { $gte: parseInt(bedrooms) };

    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    const properties = await Property.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Property.countDocuments(query);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: properties
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get featured properties
exports.getFeaturedProperties = async (req, res) => {
  try {
    const properties = await Property.find({ 
      isFeatured: true, 
      status: 'available' 
    }).limit(6);
    
    res.status(200).json({
      success: true,
      data: properties
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get property by ID
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update property
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: property,
      message: 'Property updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete property
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status: 'sold' },
      { new: true }
    );
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Property marked as sold'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Search properties
exports.searchProperties = async (req, res) => {
  try {
    const { q } = req.query;
    
    const properties = await Property.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { 'location.area': { $regex: q, $options: 'i' } },
        { 'location.city': { $regex: q, $options: 'i' } }
      ],
      status: 'available'
    }).limit(20);
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
