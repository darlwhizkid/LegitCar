const Application = require('../models/Application');
const User = require('../models/User');

// @desc    Create new application
// @route   POST /api/applications
// @access  Private
exports.createApplication = async (req, res) => {
  try {
    const {
      serviceType,
      vehicleDetails,
      priority = 'medium'
    } = req.body;

    // Set estimated completion date based on service type
    const estimatedDays = {
      'vehicle-registration': 7,
      'document-renewal': 5,
      'ownership-transfer': 10,
      'drivers-license': 14,
      'vehicle-accessories': 3,
      'maritime-registration': 21,
      'aviation-documentation': 30
    };

    const estimatedCompletionDate = new Date();
    estimatedCompletionDate.setDate(
      estimatedCompletionDate.getDate() + (estimatedDays[serviceType] || 7)
    );

    // Set fees based on service type
    const serviceFees = {
      'vehicle-registration': 25000,
      'document-renewal': 15000,
      'ownership-transfer': 20000,
      'drivers-license': 10000,
      'vehicle-accessories': 5000,
      'maritime-registration': 50000,
      'aviation-documentation': 100000
    };

    const governmentFees = {
      'vehicle-registration': 15000,
      'document-renewal': 8000,
      'ownership-transfer': 12000,
      'drivers-license': 6500,
      'vehicle-accessories': 2000,
      'maritime-registration': 75000,
      'aviation-documentation': 200000
    };

    const application = await Application.create({
      user: req.user.id,
      serviceType,
      vehicleDetails,
      priority,
      estimatedCompletionDate,
      fees: {
        serviceFee: serviceFees[serviceType] || 10000,
        governmentFee: governmentFees[serviceType] || 5000
      }
    });

    // Populate user details
    await application.populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      application
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating application'
    });
  }
};

// @desc    Get all applications for logged in user
// @route   GET /api/applications
// @access  Private
exports.getMyApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Filter options
    const filter = { user: req.user.id };
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.serviceType) {
      filter.serviceType = req.query.serviceType;
    }

    // Sort options
    const sortBy = req.query.sortBy || '-createdAt';

    const applications = await Application.find(filter)
      .populate('user', 'name email phone')
      .populate('assignedAgent', 'name email')
      .sort(sortBy)
      .limit(limit * 1)
      .skip(startIndex);

    const total = await Application.countDocuments(filter);

    // Pagination result
    const pagination = {};

    if (startIndex + limit < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      pagination,
      applications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching applications'
    });
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('assignedAgent', 'name email')
      .populate('notes.addedBy', 'name');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Make sure user owns application or is admin/agent
    if (application.user._id.toString() !== req.user.id && 
        !['admin', 'agent'].includes(req.user.role)) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this application'
      });
    }

    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching application'
    });
  }
};

// @desc    Track application by application number
// @route   GET /api/applications/track/:applicationNumber
// @access  Public (but requires application number)
exports.trackApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      applicationNumber: req.params.applicationNumber
    })
    .populate('user', 'name email phone')
    .populate('assignedAgent', 'name email')
    .select('-notes'); // Don't include internal notes for public tracking

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found with that number'
      });
    }

    // Return limited information for public tracking
    const trackingInfo = {
      applicationNumber: application.applicationNumber,
      serviceType: application.serviceType,
      status: application.status,
      priority: application.priority,
      estimatedCompletionDate: application.estimatedCompletionDate,
      actualCompletionDate: application.actualCompletionDate,
      createdAt: application.createdAt,
      fees: {
        totalFee: application.fees.totalFee,
        paid: application.fees.paid
      }
    };

    res.status(200).json({
      success: true,
      application: trackingInfo
    });
  } catch (error) {
    console.error('Track application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error tracking application'
    });
  }
};

// @desc    Update application (Admin/Agent only)
// @route   PUT /api/applications/:id
// @access  Private (Admin/Agent)
exports.updateApplication = async (req, res) => {
  try {
    let application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const allowedUpdates = [
      'status',
      'priority',
      'estimatedCompletionDate',
      'actualCompletionDate',
      'assignedAgent',
      'fees'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // If status is being updated to completed, set actual completion date
    if (updates.status === 'completed' && !updates.actualCompletionDate) {
      updates.actualCompletionDate = new Date();
    }

    application = await Application.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    ).populate('user', 'name email phone')
     .populate('assignedAgent', 'name email');

    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating application'
    });
  }
};

// @desc    Add note to application
// @route   POST /api/applications/:id/notes
// @access  Private
exports.addNote = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns application or is admin/agent
    if (application.user.toString() !== req.user.id && 
        !['admin', 'agent'].includes(req.user.role)) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to add notes to this application'
      });
    }

    const note = {
      message: req.body.message,
      addedBy: req.user.id
    };

    application.notes.push(note);
    await application.save();

    await application.populate('notes.addedBy', 'name');

    res.status(200).json({
      success: true,
      message: 'Note added successfully',
      notes: application.notes
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding note'
    });
  }
};

// @desc    Delete application (Admin only)
// @route   DELETE /api/applications/:id
// @access  Private (Admin)
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting application'
    });
  }
};

// @desc    Get all applications (Admin/Agent only)
// @route   GET /api/applications/admin/all
// @access  Private (Admin/Agent)
exports.getAllApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Filter options
    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.serviceType) {
      filter.serviceType = req.query.serviceType;
    }

    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    if (req.query.assignedAgent) {
      filter.assignedAgent = req.query.assignedAgent;
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    const sortBy = req.query.sortBy || '-createdAt';

    const applications = await Application.find(filter)
      .populate('user', 'name email phone')
      .populate('assignedAgent', 'name email')
      .sort(sortBy)
      .limit(limit * 1)
      .skip(startIndex);

    const total = await Application.countDocuments(filter);

    // Statistics
    const stats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const pagination = {};

    if (startIndex + limit < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      stats,
      pagination,
      applications
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching applications'
    });
  }
};