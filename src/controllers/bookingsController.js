const Booking = require('../models/Booking');
const Ride = require('../models/Ride');

const createBooking = async (req, res) => {
  try {
    const { rideId, seatsBooked } = req.body;

    if (!rideId || !seatsBooked) {
      return res.status(400).json({ error: 'Ride ID and seats are required' });
    }

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    if (ride.driver.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot book your own ride' });
    }

    if (ride.seatsAvailable < seatsBooked) {
      return res.status(400).json({ error: 'Not enough seats available' });
    }

    if (ride.status !== 'upcoming') {
      return res.status(400).json({ error: 'Ride is not available for booking' });
    }

    const totalPrice = ride.pricePerSeat * seatsBooked;

    const booking = new Booking({
      ride: rideId,
      passenger: req.user._id,
      seatsBooked,
      totalPrice
    });

    await booking.save();

    ride.seatsAvailable -= seatsBooked;
    await ride.save();

    await booking.populate([
      { path: 'ride', populate: { path: 'driver', select: 'name email phone rating' } },
      { path: 'passenger', select: 'name email phone' }
    ]);

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ passenger: req.user._id })
      .populate({
        path: 'ride',
        populate: { path: 'driver', select: 'name email phone rating' }
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      passenger: req.user._id
    }).populate('ride');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    const ride = await Ride.findById(booking.ride._id);
    ride.seatsAvailable += booking.seatsBooked;
    await ride.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking
};
