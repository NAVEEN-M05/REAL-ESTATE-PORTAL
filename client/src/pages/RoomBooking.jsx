import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  CalendarCheck,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  Zap,
  Search
} from 'lucide-react';

export default function RoomBooking({ isModalOpen, setIsModalOpen }) {
  const { bookings, rooms, createBooking, updateBookingStatus } = useCampus();
  const { role } = useAuth();

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRoom, setFilterRoom] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [roomId, setRoomId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('12:00');
  const [attendees, setAttendees] = useState(15);
  const [autoDevices, setAutoDevices] = useState(true);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useState(() => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  });

  const selectedRoomObj = rooms.find(r => r.id === parseInt(roomId, 10));

  const filteredBookings = bookings.filter(b => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (filterRoom !== 'all' && b.room_id !== parseInt(filterRoom, 10)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.purpose.toLowerCase().includes(q) ||
        (b.room_name && b.room_name.toLowerCase().includes(q)) ||
        (b.user_name && b.user_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!roomId) {
      setFormError('Please select a facility from the list.');
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}:00`);
    const endDateTime = new Date(`${endDate}T${endTime}:00`);

    if (startDateTime >= endDateTime) {
      setFormError('Reservation end time must be after start time.');
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({
        room_id: parseInt(roomId, 10),
        purpose,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        attendees: parseInt(attendees, 10),
        auto_devices: autoDevices,
        notes
      });

      setPurpose('');
      setNotes('');
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-emerald-700" />
            <span>Room Booking</span>
          </h1>
          <p className="mt-0.5 text-sm text-gray-600">
            Schedule rooms and laboratories with automated conflict detection and device pre-activation.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookings..."
            className="rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none w-52"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 focus:border-emerald-600 focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={filterRoom}
          onChange={(e) => setFilterRoom(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 focus:border-emerald-600 focus:outline-none"
        >
          <option value="all">All Rooms & Labs</option>
          {rooms.map(r => (
            <option key={r.id} value={r.id}>
              {r.code} - {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500 shadow-sm">
            <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm font-semibold text-gray-800">No Reservations Found</p>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your filters or create a new reservation.</p>
          </div>
        ) : (
          filteredBookings.map(b => {
            const start = new Date(b.start_time);
            const end = new Date(b.end_time);
            const isApproved = b.status === 'approved';
            const isPending = b.status === 'pending';

            return (
              <div
                key={b.id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-gray-300 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {b.room_code || 'ROOM'}
                    </span>
                    <span className="text-xs font-bold text-gray-800">{b.room_name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                      isApproved
                        ? 'bg-emerald-100 text-emerald-800'
                        : isPending
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900">{b.purpose}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      {start.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })},{' '}
                      {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      {b.attendees} Attendees
                    </span>
                    <span>
                      Booked by: <strong className="text-gray-700">{b.user_name || 'Campus Member'}</strong> ({b.user_role})
                    </span>
                  </div>

                  {b.auto_devices && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 pt-0.5">
                      <Zap className="h-3 w-3" />
                      <span>Pre-activation: Equipment automatically powers on 10 min prior to start</span>
                    </div>
                  )}
                </div>

                {/* Status Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {(role === 'admin' || role === 'faculty') && isPending && (
                    <>
                      <button
                        onClick={() => handleStatusChange(b.id, 'approved')}
                        className="flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(b.id, 'rejected')}
                        className="flex items-center gap-1 rounded-lg bg-rose-50 border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {isApproved && (
                    <button
                      onClick={() => handleStatusChange(b.id, 'cancelled')}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel Reservation
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Booking Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Facility Reservation"
        subtitle="Select venue, schedule, and device automation preferences."
      >
        <form onSubmit={handleSubmitBooking} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Facility or Lab</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
            >
              <option value="">-- Choose Venue --</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.code} - {r.name} ({r.type}, Cap: {r.capacity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Purpose / Session Title</label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. CS302 Machine Learning Lab"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Expected Attendees</label>
            <input
              type="number"
              min="1"
              max={selectedRoomObj ? selectedRoomObj.capacity : 300}
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="autoDev"
              checked={autoDevices}
              onChange={(e) => setAutoDevices(e.target.checked)}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <label htmlFor="autoDev" className="text-xs text-gray-700">
              Automated Device Pre-Activation (Powers on lights & AC 10 min prior to start)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? 'Checking Conflict...' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
