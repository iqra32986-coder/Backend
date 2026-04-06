const Reservation = require('../models/Reservation');
const RestaurantProfile = require('../models/RestaurantProfile');

const createReservation = async (req, res) => {
    try {
        const { 
            restaurant_id, 
            tableNumber, 
            reservationDate, 
            reservationTime, 
            arrivalTime, 
            liveLocation,
            guestName,
            guestPhone,
            preOrderedItems 
        } = req.body;
        
        const reservation = new Reservation({
            customer_id: req.user._id,
            restaurant_id,
            tableNumber,
            reservationDate,
            reservationTime,
            arrivalTime,
            liveLocation,
            guestName,
            guestPhone,
            preOrderedItems: preOrderedItems || []
        });

        const createdRes = await reservation.save();
        res.status(201).json(createdRes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getRestaurantReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ restaurant_id: req.user._id })
            .populate('customer_id', 'name tag email')
            .populate({ path: 'preOrderedItems.menuItem', select: 'name price' });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getGlobalReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({})
            .populate('customer_id', 'name email')
            .populate('restaurant_id', 'name');
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateReservationStatus = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (reservation) {
            // Allow Admin or the Restaurant owner to update
            if (req.user.role !== 'Admin' && reservation.restaurant_id.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to update this reservation' });
            }

            reservation.status = req.body.status || reservation.status;
            const updated = await reservation.save();
            res.json(updated);
        } else {
            res.status(404).json({ message: 'Reservation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get all tables across all restaurants for the Unified Sitting Area
const getGlobalTables = async (req, res) => {
    try {
        const profiles = await RestaurantProfile.find({}, 'name user_id tables location bio') || [];
        const activeReservations = await Reservation.find({ 
            status: { $in: ['Pending', 'Accepted'] } 
        }) || [];

        const allTables = [];
        profiles.forEach(p => {
            (p.tables || []).forEach(t => {
                // Find matching reservation
                const matchingRes = activeReservations.find(r => 
                    r.restaurant_id.toString() === p.user_id.toString() && 
                    r.tableNumber === t.tableNumber
                );

                let status = t.status || 'Available';
                if (matchingRes) {
                    status = matchingRes.status; // 'Pending' or 'Accepted'
                }

                allTables.push({
                    _id: `${p._id}-${t.tableNumber}`,
                    restaurant_id: p.user_id,
                    profile_id: p._id,
                    restaurantName: p.name,
                    restaurantBio: p.bio,
                    tableNumber: t.tableNumber,
                    tableName: t.tableName,
                    capacity: t.capacity,
                    isWindowSeat: t.isWindowSeat,
                    placement: t.placement,
                    isOrderable: t.isOrderable,
                    status: status 
                });
            });
        });

        res.json(allTables);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { createReservation, getRestaurantReservations, getGlobalReservations, updateReservationStatus, getGlobalTables };
