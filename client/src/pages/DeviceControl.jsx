import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { useAuth } from '../context/AuthContext';
import {
  Sliders,
  Lightbulb,
  Fan,
  Wind,
  Tv,
  Monitor,
  Power,
  Users,
  Thermometer,
  ShieldCheck,
  Search,
  Zap,
  Info
} from 'lucide-react';

export default function DeviceControl({ onSelectRoom }) {
  const { rooms, devices, toggleDevice, bulkRoomControl, updateOccupancy, toggleAutoControl } = useCampus();
  const { role } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  // Filter rooms
  const filteredRooms = rooms.filter(r => {
    if (selectedBuilding !== 'all' && r.building_id !== parseInt(selectedBuilding, 10)) return false;
    if (selectedType !== 'all' && r.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q);
    }
    return true;
  });

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

  const handleOccupancyQuickSet = async (roomId, count) => {
    setUpdatingId(`occ-${roomId}`);
    try {
      await updateOccupancy(roomId, count);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAutoControlToggle = async (roomId, currentVal) => {
    setUpdatingId(`auto-${roomId}`);
    try {
      await toggleAutoControl(roomId, !currentVal);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBulkAction = async (roomId, action) => {
    setUpdatingId(`bulk-${roomId}`);
    try {
      await bulkRoomControl(roomId, action);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sliders className="h-6 w-6 text-emerald-700" />
            <span>Device Control</span>
          </h1>
          <p className="mt-0.5 text-sm text-gray-600">
            Monitor and control room devices. Set occupancy to 0 to test automated eco-shutoff.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search room code or name..."
              className="rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none w-52"
            />
          </div>

          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 focus:border-emerald-600 focus:outline-none"
          >
            <option value="all">All Buildings</option>
            <option value="1">Aryabhata Block (ASTB)</option>
            <option value="2">Kalam Tower (KET)</option>
            <option value="3">Central Library (CDL)</option>
            <option value="4">Tagore Auditorium (TSA)</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 focus:border-emerald-600 focus:outline-none"
          >
            <option value="all">All Facilities</option>
            <option value="lab">Laboratories</option>
            <option value="classroom">Classrooms</option>
            <option value="library_hall">Study Pods</option>
            <option value="seminar_hall">Auditoriums</option>
          </select>
        </div>
      </div>

      {/* Info Tip */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 flex items-start gap-3">
        <Info className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" />
        <div>
          <strong>Automatic Light & Fan Control:</strong> Set any occupied room to <strong>"Empty (0)"</strong> below. When occupancy is zero and Auto-Eco is active, the software automatically shuts off idle devices within 4 seconds.
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredRooms.map(room => {
          const roomDevices = devices.filter(d => d.room_id === room.id);
          const activeCount = roomDevices.filter(d => d.status === 'on').length;
          const powerW = roomDevices
            .filter(d => d.status === 'on')
            .reduce((sum, d) => sum + Number(d.power_watts), 0);
          const isOccupied = (room.current_occupancy || 0) > 0;

          return (
            <div
              key={room.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-gray-300 transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Room Header */}
                <div className="flex items-start justify-between pb-3.5 border-b border-gray-100">
                  <div
                    onClick={() => onSelectRoom && onSelectRoom(room)}
                    className="cursor-pointer group"
                    title="Click for full room details"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {room.code}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">{room.type.replace('_', ' ')} • Floor {room.floor}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        isOccupied ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isOccupied ? 'Occupied' : 'Vacant'}
                      </span>
                    </div>
                    <h3 className="mt-1 text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {room.name}
                    </h3>
                    <p className="text-xs text-gray-500">{room.building_name}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-emerald-700 font-bold text-sm">
                      {powerW.toFixed(0)} W
                    </div>
                    <div className="text-xs text-gray-500 flex items-center justify-end gap-1 mt-0.5">
                      <Thermometer className="h-3 w-3 text-gray-400" />
                      <span>{room.temp_celsius || 24.0}°C</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Occupancy & Auto-Control Section */}
                <div className="mt-4 rounded-lg bg-gray-50 p-3 border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>Simulated Occupancy: <strong className="text-gray-900">{room.current_occupancy} / {room.capacity} pax</strong></span>
                    </div>

                    <button
                      onClick={() => handleAutoControlToggle(room.id, room.auto_control_enabled)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded border transition-colors ${
                        room.auto_control_enabled
                          ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                          : 'border-gray-300 bg-gray-200 text-gray-700'
                      }`}
                    >
                      Auto-Eco: {room.auto_control_enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
                    <span className="text-xs text-gray-500">Set Occupancy:</span>
                    <button
                      onClick={() => handleOccupancyQuickSet(room.id, 0)}
                      className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                        room.current_occupancy === 0
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Empty (0)
                    </button>
                    <button
                      onClick={() => handleOccupancyQuickSet(room.id, Math.floor(room.capacity * 0.5))}
                      className="rounded bg-white border border-gray-300 px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-100"
                    >
                      Half ({Math.floor(room.capacity * 0.5)})
                    </button>
                    <button
                      onClick={() => handleOccupancyQuickSet(room.id, room.capacity)}
                      className="rounded bg-white border border-gray-300 px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-100"
                    >
                      Full ({room.capacity})
                    </button>
                  </div>
                </div>

                {/* Device List */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                    <span>Connected Equipment ({activeCount}/{roomDevices.length} ON)</span>
                    <span>Power Rating</span>
                  </div>

                  <div className="space-y-1.5">
                    {roomDevices.map(device => {
                      const Icon = getDeviceIcon(device.type);
                      const isOn = device.status === 'on';

                      return (
                        <div
                          key={device.id}
                          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2.5 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded ${isOn ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{device.name}</div>
                              <div className="text-[11px] text-gray-500">
                                {device.auto_controlled ? 'Auto-Controlled' : 'Manual Lock'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-gray-500 font-medium">{device.power_watts}W</span>
                            
                            {/* Toggle Switch */}
                            <button
                              onClick={() => handleDeviceToggle(device.id, device.status)}
                              disabled={updatingId === `device-${device.id}`}
                              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isOn ? 'bg-emerald-600' : 'bg-gray-300'
                              } disabled:opacity-50`}
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
              </div>

              {/* Room Presets Footer */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Presets:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkAction(room.id, 'all_off')}
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    All Off
                  </button>
                  <button
                    onClick={() => handleBulkAction(room.id, 'eco_lights_only')}
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Eco Mode
                  </button>
                  <button
                    onClick={() => handleBulkAction(room.id, 'all_on')}
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    All On
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
