import React from 'react';
import { useCampus } from '../context/CampusContext';
import {
  Building,
  Users,
  SunMedium,
  Sliders,
  ArrowRight
} from 'lucide-react';

export default function BuildingDetail({ building, onBack, onSelectRoom }) {
  const { rooms, devices } = useCampus();

  if (!building) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500 shadow-sm">
        <Building className="mx-auto h-10 w-10 text-gray-400 mb-2" />
        <p className="font-semibold text-gray-900">Building information not selected</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-emerald-600 text-xs font-semibold rounded-lg text-white">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const buildingRooms = rooms.filter(r => r.building_id === building.id);
  const buildingRoomIds = buildingRooms.map(r => r.id);
  const buildingDevices = devices.filter(d => buildingRoomIds.includes(d.room_id));
  const activeDevices = buildingDevices.filter(d => d.status === 'on');
  const powerW = activeDevices.reduce((sum, d) => sum + Number(d.power_watts), 0);
  const totalOccupants = buildingRooms.reduce((sum, r) => sum + (r.current_occupancy || 0), 0);
  const totalCapacity = buildingRooms.reduce((sum, r) => sum + (r.capacity || 0), 0);

  return (
    <div className="space-y-6">
      {/* Building Header Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              {building.code}
            </span>
            <span className="text-xs text-gray-500">{building.total_floors || 4} Floors</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{building.name}</h1>
          <p className="mt-0.5 text-xs text-gray-500">
            Target Budget: {(building.carbon_target_kwh / 24).toFixed(1)} kW • Current Draw: {(powerW / 1000).toFixed(2)} kW
          </p>
        </div>

        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-right">
          <span className="text-xs text-gray-500">Total Active Load</span>
          <div className="text-2xl font-bold text-gray-900">
            {(powerW / 1000).toFixed(2)} <span className="text-xs font-normal text-gray-500">kW</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Occupancy</span>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <div className="mt-1.5 text-xl font-bold text-gray-900">
            {totalOccupants} / {totalCapacity} <span className="text-xs font-normal text-gray-500">pax</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full"
              style={{ width: `${totalCapacity ? (totalOccupants / totalCapacity) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Facility Status</span>
            <Building className="h-4 w-4 text-gray-400" />
          </div>
          <div className="mt-1.5 text-xl font-bold text-gray-900">
            {buildingRooms.filter(r => r.current_occupancy > 0).length} / {buildingRooms.length}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Rooms currently occupied</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Rooftop Solar PV</span>
            <SunMedium className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-1.5 text-xl font-bold text-amber-700">
            9.4 <span className="text-xs font-normal text-gray-500">kW Generation</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Direct building offset</p>
        </div>
      </div>

      {/* Facilities inside this building */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Sliders className="h-4 w-4 text-emerald-700" />
          <span>Rooms & Labs in {building.code}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buildingRooms.map(room => {
            const rDevs = devices.filter(d => d.room_id === room.id);
            const rActive = rDevs.filter(d => d.status === 'on');
            const rWatts = rActive.reduce((sum, d) => sum + Number(d.power_watts), 0);

            return (
              <div
                key={room.id}
                onClick={() => onSelectRoom(room)}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-emerald-600 hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {room.code}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">Floor {room.floor} • {room.type}</span>
                    </div>
                    <h3 className="mt-1 text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {room.name}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{rWatts.toFixed(0)} W</span>
                    <span className="text-xs text-gray-500 block">{rActive.length}/{rDevs.length} Active</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500 pt-2.5 border-t border-gray-100">
                  <span>{room.current_occupancy} / {room.capacity} Occupants</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    View Controls <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
