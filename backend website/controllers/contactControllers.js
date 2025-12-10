const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Submit contact form
exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message, propertyId } = req.body;
    
    // Save to database
    const contact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
      propertyId
    });
    
    await contact.save();
    
    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || 'mohallaproperties@gmail.com',
      subject: `New Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    // Send auto-reply to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for contacting Mohalla Properties',
      html: `
        <h2>Thank you for contacting Mohalla Properties!</h2>
        <p>Dear ${name},</p>
        <p>We have received your inquiry and our team will get back to you within 24 hours.</p>
        <p><strong>Your Query:</strong> ${subject}</p>
        <p><strong>Your Message:</strong> ${message}</p>
        <br>
        <p>Best Regards,</p>
        <p>Mohalla Properties Team</p>
        <p>Phone: 92-2025-2020, 92-2024-2020</p>
        <p>Address: Shop No. 20-A, Jharoda Rd, Near Nayra Petrol Pump, Saraswati Kunj, Najafgarh, Delhi, 110043</p>
      `
    };
    
    await transporter.sendMail(userMailOptions);
    
    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
};

// Get all contacts (admin only)
exports.getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const query = {};
    if (status) query.status = status;
    
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Contact.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: contacts.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: contacts
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update contact status
exports.updateContactStatus = async (req, res) => {
  try {
    const { status, responseMessage } = req.body;
    
    const updateData = { status };
    
    if (responseMessage) {
      updateData.response = {
        message: responseMessage,
        repliedBy: req.user.id,
        repliedAt: new Date()
      };
    }
    
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: contact,
      message: 'Contact updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
