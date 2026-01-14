const express = require('express');

const {
  createBooking,
  getMyBookings,
  cancelBooking
} = require('../controllers/bookingsController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createBooking);
router.get('/my-bookings', auth, getMyBookings);
router.delete('/:id', auth, cancelBooking);

module.exports = router;
