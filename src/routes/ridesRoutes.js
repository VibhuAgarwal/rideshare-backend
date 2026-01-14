const express = require('express');

const {
  createRide,
  searchRides,
  getMyRides,
  getRideById,
  cancelRide
} = require('../controllers/ridesController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createRide);
router.get('/search', auth, searchRides);
router.get('/my-rides', auth, getMyRides);
router.get('/:id', auth, getRideById);
router.delete('/:id', auth, cancelRide);

module.exports = router;
