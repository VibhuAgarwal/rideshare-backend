const Ride = require('../models/Ride');
const Car = require('../models/Car');

const createRide = async (req, res) => {
  try {
    const { carId, from, to, date, seatsAvailable, pricePerSeat } = req.body;

    if (!carId || !from || !to || !date || !seatsAvailable || !pricePerSeat) {
      return res.status(400).json({ error: 'All fields are required (including car)' });
    }

    const car = await Car.findOne({ _id: carId, owner: req.user._id });
    if (!car) {
      return res.status(400).json({ error: 'Invalid car selected' });
    }

    const seats = parseInt(seatsAvailable, 10);
    if (!Number.isFinite(seats) || seats <= 0) {
      return res.status(400).json({ error: 'Seats available must be a positive number' });
    }

    if (seats > car.seatsAvailable) {
      return res.status(400).json({ error: 'Seats available cannot exceed car seats' });
    }

    const price = parseFloat(pricePerSeat);
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ error: 'Price per seat must be a positive number' });
    }

    const ride = new Ride({
      driver: req.user._id,
      car: car._id,
      from,
      to,
      date,
      seatsAvailable: seats,
      totalSeats: seats,
      pricePerSeat: price
    });

    await ride.save();
    await ride.populate([
      { path: 'driver', select: 'name email phone rating' },
      { path: 'car', select: 'company model carNumber seatsAvailable color' }
    ]);

    res.status(201).json(ride);
  } catch (error) {
    console.error('Create ride error:', error);
    res.status(500).json({ error: error.message });
  }
};

const searchRides = async (req, res) => {
  try {
    const { from, to, date, seats } = req.query;

    const query = {
      status: 'upcoming',
      driver: { $ne: req.user._id }
    };

    if (from) query.from = new RegExp(from, 'i');
    if (to) query.to = new RegExp(to, 'i');
    if (seats) query.seatsAvailable = { $gte: parseInt(seats) };
    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: searchDate, $lt: nextDay };
    }

    const rides = await Ride.find(query)
      .populate('driver', 'name email phone rating')
      .populate('car', 'company model carNumber seatsAvailable color')
      .sort({ date: 1 });

    res.json(rides);
  } catch (error) {
    console.error('Search rides error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getMyRides = async (req, res) => {
  try {
    const rides = await Ride.find({ driver: req.user._id })
      .populate('driver', 'name email phone rating')
      .populate('car', 'company model carNumber seatsAvailable color')
      .sort({ date: -1 });

    res.json(rides);
  } catch (error) {
    console.error('Get my rides error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driver', 'name email phone rating')
      .populate('car', 'company model carNumber seatsAvailable color');

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    res.json(ride);
  } catch (error) {
    console.error('Get ride error:', error);
    res.status(500).json({ error: error.message });
  }
};

const cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findOne({ _id: req.params.id, driver: req.user._id });

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found or unauthorized' });
    }

    ride.status = 'cancelled';
    await ride.save();

    res.json({ message: 'Ride cancelled successfully' });
  } catch (error) {
    console.error('Cancel ride error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRide,
  searchRides,
  getMyRides,
  getRideById,
  cancelRide
};
