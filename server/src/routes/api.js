const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middleware/authMiddleware');
const authCtrl = require('../controllers/authController');
const energyCtrl = require('../controllers/energyController');
const roomCtrl = require('../controllers/roomController');
const deviceCtrl = require('../controllers/deviceController');
const bookingCtrl = require('../controllers/bookingController');
const alertCtrl = require('../controllers/alertController');
const reportCtrl = require('../controllers/reportController');

// 1. Auth routes
router.post('/auth/login', authCtrl.login);
router.post('/auth/demo-login', authCtrl.demoLogin);
router.post('/auth/register', authCtrl.register);
router.get('/auth/me', authenticate, authCtrl.getProfile);
router.put('/auth/profile', authenticate, authCtrl.updateProfile);

// 2. Energy Monitoring routes
router.get('/energy/metrics', energyCtrl.getLiveMetrics);
router.get('/energy/building/:buildingId', energyCtrl.getBuildingAnalytics);

// 3. Room Management routes
router.get('/rooms', roomCtrl.getAllRooms);
router.put('/rooms/:id/occupancy', roomCtrl.updateRoomOccupancy);
router.put('/rooms/:id/auto-control', roomCtrl.toggleAutoControl);

// 4. Device Control routes
router.get('/devices', deviceCtrl.getAllDevices);
router.put('/devices/:id/toggle', deviceCtrl.toggleDevice);
router.post('/devices/room/:roomId/bulk', deviceCtrl.bulkRoomControl);

// 5. Booking routes
router.get('/bookings', bookingCtrl.getAllBookings);
router.post('/bookings', bookingCtrl.createBooking);
router.put('/bookings/:id/status', bookingCtrl.updateBookingStatus);

// 6. Alerts routes
router.get('/alerts', alertCtrl.getAllAlerts);
router.put('/alerts/:id/resolve', alertCtrl.resolveAlert);
router.post('/alerts/test', alertCtrl.triggerTestAlert);

// 7. Reports routes
router.get('/reports/energy', reportCtrl.getEnergyReport);
router.get('/reports/export-csv', reportCtrl.exportCSV);

module.exports = router;
