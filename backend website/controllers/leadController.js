const Lead = require('../models/Lead');
const Property = require('../models/Property');

// Create new lead
exports.createLead = async (req, res) => {
  try {
    const lead = new Lead(req.body);
    await lead.save();
    
    res.status(201).json({
      success: true,
      data: lead,
      message: 'Lead created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all leads
exports.getAllLeads = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      source,
      assignedTo,
      startDate,
      endDate
    } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (source) query.source = source;
    if (assignedTo) query.assignedTo = assignedTo;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Lead.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: leads.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: leads
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get lead by ID
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email phone')
      .populate('notes.createdBy', 'name');
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    // Get suggested properties based on lead preferences
    let suggestedProperties = [];
    if (lead.propertyType && lead.location) {
      suggestedProperties = await Property.find({
        propertyType: lead.propertyType,
        'location.area': lead.location,
        status: 'available'
      }).limit(5);
    }
    
    res.status(200).json({
      success: true,
      data: {
        lead,
        suggestedProperties
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update lead
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: lead,
      message: 'Lead updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Add note to lead
exports.addNote = async (req, res) => {
  try {
    const { note } = req.body;
    
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    lead.notes.push({
      note,
      createdBy: req.user.id
    });
    
    await lead.save();
    
    res.status(200).json({
      success: true,
      data: lead,
      message: 'Note added successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get lead statistics
exports.getLeadStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    // Total leads
    const totalLeads = await Lead.countDocuments();
    
    // Leads by status
    const leadsByStatus = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Leads by source
    const leadsBySource = await Lead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);
    
    // Monthly leads
    const monthlyLeads = await Lead.aggregate([
      {
        $match: { createdAt: { $gte: startOfMonth } }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Weekly conversion rate
    const weeklyLeads = await Lead.countDocuments({ createdAt: { $gte: startOfWeek } });
    const weeklyConverted = await Lead.countDocuments({ 
      createdAt: { $gte: startOfWeek },
      status: 'converted'
    });
    
    const conversionRate = weeklyLeads > 0 ? (weeklyConverted / weeklyLeads) * 100 : 0;
    
    res.status(200).json({
      success: true,
      data: {
        totalLeads,
        leadsByStatus,
        leadsBySource,
        monthlyLeads,
        weeklyStats: {
          leads: weeklyLeads,
          converted: weeklyConverted,
          conversionRate: conversionRate.toFixed(2)
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
