const express = require('express');
const {
  createApplication,
  getMyApplications,
  getApplication,
  trackApplication,
  updateApplication,
  addNote,
  deleteApplication,
  getAllApplications
} = require('../controllers/applicationController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/track/:applicationNumber', trackApplication);

// Protected routes (require authentication)
router.use(protect);

// User routes
router.route('/')
  .get(getMyApplications)
  .post(createApplication);

router.route('/:id')
  .get(getApplication);

router.post('/:id/notes', addNote);

// Admin/Agent routes
router.get('/admin/all', authorize('admin', 'agent'), getAllApplications);
router.put('/:id', authorize('admin', 'agent'), updateApplication);
router.delete('/:id', authorize('admin'), deleteApplication);

module.exports = router;