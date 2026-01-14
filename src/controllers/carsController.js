const Car = require('../models/Car');

const listMyCars = async (req, res) => {
  try {
    const cars = await Car.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    console.error('List cars error:', error);
    res.status(500).json({ error: error.message });
  }
};

const createCar = async (req, res) => {
  try {
    const { company, model, carNumber, seatsAvailable, color } = req.body;

    if (!company || !model || !carNumber || !seatsAvailable || !color) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const seats = parseInt(seatsAvailable, 10);
    if (!Number.isFinite(seats) || seats <= 0) {
      return res.status(400).json({ error: 'Seats available must be a positive number' });
    }

    const car = new Car({
      owner: req.user._id,
      company,
      model,
      carNumber,
      seatsAvailable: seats,
      color
    });

    await car.save();
    res.status(201).json(car);
  } catch (error) {
    // Duplicate carNumber per owner
    if (error?.code === 11000) {
      return res.status(400).json({ error: 'Car number already exists' });
    }

    console.error('Create car error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateCar = async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, owner: req.user._id });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    const { company, model, carNumber, seatsAvailable, color } = req.body;

    if (company !== undefined) car.company = company;
    if (model !== undefined) car.model = model;
    if (carNumber !== undefined) car.carNumber = carNumber;
    if (color !== undefined) car.color = color;

    if (seatsAvailable !== undefined) {
      const seats = parseInt(seatsAvailable, 10);
      if (!Number.isFinite(seats) || seats <= 0) {
        return res.status(400).json({ error: 'Seats available must be a positive number' });
      }
      car.seatsAvailable = seats;
    }

    await car.save();
    res.json(car);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ error: 'Car number already exists' });
    }

    console.error('Update car error:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteCar = async (req, res) => {
  try {
    const car = await Car.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Delete car error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  listMyCars,
  createCar,
  updateCar,
  deleteCar
};
