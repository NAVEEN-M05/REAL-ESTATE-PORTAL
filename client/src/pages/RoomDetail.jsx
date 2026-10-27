import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import {
  Lightbulb,
  Fan,
  Wind,
  Tv,
  Monitor,
  Power,
  Users,
  Thermometer,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export default function RoomDetail({ room, onBack }) {
  const { devices, bookings, toggleDevice, bulkRoomControl, updateOccupancy, toggleAutoControl } = useCampus();
  const [updatingId, setUpdatingId] = useState(null);

  if (!room) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500 shadow-sm">
        <p className="font-semibold text-gray-900">Facility not selected</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-emerald-600 text-xs font-semibold rounded-lg text-white">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const roomDevices = devices.filter(d => d.room_id === room.id);
  const activeCount = roomDevices.filter(d => d.status === 'on').length;
  const powerW = roomDevices
    .filter(d => d.status === 'on')
    .reduce((sum, d) => sum + Number(d.power_watts), 0);
  const roomBookings = bookings.filter(b => b.room_id === room.id);

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'light': return Lightbulb;
      case 'fan': return Fan;
      case 'ac': return Wind;
      case 'projector': return Tv;
      case 'workstation': return Monitor;
      default: return Power;
    }
  };

  const handleDeviceToggle = async (deviceId, currentStatus) => {
    const nextStatus = currentStatus === 'on' ? 'off' : 'on';
    setUpdatingId(`device-${deviceId}`);
    try {
      await toggleDevice(deviceId, nextStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOccupancyQuickSet = async (count) => {
    setUpdatingId(`occ-${room.id}`);
    try {
      await updateOccupancy(room.id, count);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              {room.code}
            </span>
            <span className="text-xs text-gray-500 capitalize">{room.type.replace('_', ' ')} • Floor {room.floor}</span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-500">{room.building_name}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{room.name}</h1>
          <p className="mt-0.5 text-xs text-gray-500">
            Capacity: {room.capacity} pax • Power: <strong className="text-emerald-700">{powerW.toFixed(0)} W</strong>
          </p>
        </div>

        <div>
          <button
            onClick={() => toggleAutoControl(room.id, !room.auto_control_enabled)}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold border transition-colors ${
              room.auto_control_enabled
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'border-gray-300 bg-gray-100 text-gray-700'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Auto-Eco: {room.auto_control_enabled ? 'ENABLED' : 'DISABLED'}</span>
          </button>
        </div>
      </div>

      {/* Sensor Cluster */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-gray-500">Temperature</span>
          <div className="mt-1 text-xl font-bold text-gray-900">
            {room.temp_celsius || 24.2}°C
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Thermostat Setpoint</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-gray-500">Relative Humidity</span>
          <div className="mt-1 text-xl font-bold text-gray-900">
            44%
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Normal (40-60%)</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-gray-500">Illuminance</span>
          <div className="mt-1 text-xl font-bold text-gray-900">
            420 lx
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Daylight Sensor</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-gray-500">Air Quality</span>
          <div className="mt-1 text-xl font-bold text-emerald-700">
            32 AQI (Good)
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">CO₂: 480 ppm</p>
        </div>
      </div>

      {/* Simulated Occupancy & Eco Testing */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Occupancy Simulation</h2>
            <p className="text-xs text-gray-500">Simulate room occupancy to test automated shutoff</p>
          </div>

          <div className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded">
            Current: {room.current_occupancy} / {room.capacity} Occupants
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs text-gray-500">Set Occupancy:</span>
          <button
            onClick={() => handleOccupancyQuickSet(0)}
            className={`rounded px-3 py-1 text-xs font-semibold transition-colors ${
              room.current_occupancy === 0
                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Empty (0) - Trigger Eco
          </button>
          <button
            onClick={() => handleOccupancyQuickSet(Math.floor(room.capacity * 0.5))}
            className="rounded bg-white border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 font-medium"
          >
            Half ({Math.floor(room.capacity * 0.5)})
          </button>
          <button
            onClick={() => handleOccupancyQuickSet(room.capacity)}
            className="rounded bg-white border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 font-medium"
          >
            Full ({room.capacity})
          </button>
        </div>
      </div>

      {/* Connected Devices */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Equipment Controls ({activeCount}/{roomDevices.length} On)</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => bulkRoomControl(room.id, 'all_off')}
              className="rounded border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50 font-medium"
            >
              All Off
            </button>
            <button
              onClick={() => bulkRoomControl(room.id, 'all_on')}
              className="rounded border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50 font-medium"
            >
              All On
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {roomDevices.map(device => {
            const Icon = getDeviceIcon(device.type);
            const isOn = device.status === 'on';

            return (
              <div
                key={device.id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${isOn ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-xs">{device.name}</h3>
                    <p className="text-[11px] text-gray-500">{device.power_watts}W</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${isOn ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                    {isOn ? 'Active' : 'Standby'}
                  </span>

                  <button
                    onClick={() => handleDeviceToggle(device.id, device.status)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isOn ? 'bg-emerald-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isOn ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-700" />
          <span>Scheduled Reservations for this Room</span>
        </h2>

        {roomBookings.length === 0 ? (
          <p className="text-xs text-gray-500 py-2">No active bookings for this room.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {roomBookings.map(b => (
              <div key={b.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-gray-900">{b.purpose}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {b.user_name}
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                  b.status === 'approved' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                }`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
