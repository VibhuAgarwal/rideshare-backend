const Ride = require('../models/Ride');

const createRide = async (req, res) => {
  try {
    const { from, to, date, seatsAvailable, pricePerSeat } = req.body;

    if (!from || !to || !date || !seatsAvailable || !pricePerSeat) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const ride = new Ride({
      driver: req.user._id,
      from,
      to,
      date,
      seatsAvailable,
      totalSeats: seatsAvailable,
      pricePerSeat
    });

    await ride.save();
    await ride.populate('driver', 'name email phone rating');

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
      .populate('driver', 'name email phone rating');

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
