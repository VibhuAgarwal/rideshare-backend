const express = require('express');

const { auth } = require('../middleware/auth');
const {
  listMyCars,
  createCar,
  updateCar,
  deleteCar
} = require('../controllers/carsController');

const router = express.Router();

router.get('/', auth, listMyCars);
router.post('/', auth, createCar);
router.put('/:id', auth, updateCar);
router.delete('/:id', auth, deleteCar);

module.exports = router;
