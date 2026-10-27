import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCampus } from '../context/CampusContext';
import {
  UserCheck,
  Shield,
  Mail,
  Phone,
  Building,
  Save,
  Bell
} from 'lucide-react';

export default function ProfileSettings({ onBack }) {
  const { user, updateProfile, role } = useAuth();
  const { addToast } = useCampus();

  const [formData, setFormData] = useState({
    name: user?.name || 'Dr. Evelyn Reed',
    email: user?.email || 'admin@campus.edu',
    title: user?.title || 'Director of Campus Infrastructure & Energy Operations',
    department: user?.department || 'Campus Infrastructure & Facilities Management',
    phone: user?.phone || '+1 (555) 019-2834',
    office: user?.office || 'Oakridge Administration Block, Suite 302',
    bio: user?.bio || 'Overseeing sustainable campus transformation, renewable energy integration, and smart automated environmental controls across 4 academic blocks.',
    notifications: {
      emailSpikes: user?.notifications?.emailSpikes ?? true,
      dailyDigest: user?.notifications?.dailyDigest ?? true,
      smsUrgent: user?.notifications?.smsUrgent ?? false
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleNotificationToggle = (key) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
    setHasChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(formData);
      addToast('Profile updated successfully!', 'success');
      setHasChanges(false);
    } catch (err) {
      addToast('Failed to save profile: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-emerald-700" />
            <span>Profile & Account Settings</span>
          </h1>
          <p className="mt-0.5 text-sm text-gray-600">
            Manage your personal profile, institutional contact info, and alert subscriptions.
          </p>
        </div>

        {hasChanges && (
          <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full self-start sm:self-auto">
            Unsaved Changes
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card Header with Avatar */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="h-16 w-16 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-sm">
            {formData.name.charAt(0) || 'U'}
          </div>

          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-xl font-bold text-gray-900">{formData.name}</span>
              <span className="rounded bg-emerald-50 text-emerald-800 px-2.5 py-0.5 text-xs font-semibold border border-emerald-200 uppercase">
                {role}
              </span>
            </div>
            <p className="text-xs text-emerald-700 font-medium">{formData.title}</p>
            <p className="text-xs text-gray-500">{formData.department}</p>
          </div>
        </div>

        {/* Edit Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Shield className="h-4 w-4 text-emerald-700" />
              <h2 className="text-sm font-bold text-gray-900">Personal Information</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Official Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Building className="h-4 w-4 text-emerald-700" />
              <h2 className="text-sm font-bold text-gray-900">Campus Contact</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone / Extension</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Office Location</label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  value={formData.office}
                  onChange={(e) => handleChange('office', e.target.value)}
                  placeholder="e.g. Administration Block, Room 302"
                  className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Professional Bio</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Bell className="h-4 w-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-gray-900">Email & Alert Preferences</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <label
              onClick={() => handleNotificationToggle('emailSpikes')}
              className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
                formData.notifications.emailSpikes
                  ? 'border-emerald-300 bg-emerald-50 text-gray-900'
                  : 'border-gray-200 bg-gray-50 text-gray-600'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Power Surge Alerts</span>
                <span className={`text-xs ${formData.notifications.emailSpikes ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>✓</span>
              </div>
              <p className="mt-1 text-[11px] text-gray-500">Instant notification when a facility exceeds power allocation.</p>
            </label>

            <label
              onClick={() => handleNotificationToggle('dailyDigest')}
              className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
                formData.notifications.dailyDigest
                  ? 'border-emerald-300 bg-emerald-50 text-gray-900'
                  : 'border-gray-200 bg-gray-50 text-gray-600'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Daily Energy Digest</span>
                <span className={`text-xs ${formData.notifications.dailyDigest ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>✓</span>
              </div>
              <p className="mt-1 text-[11px] text-gray-500">Summary of daily conserved kWh and solar generation.</p>
            </label>

            <label
              onClick={() => handleNotificationToggle('smsUrgent')}
              className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
                formData.notifications.smsUrgent
                  ? 'border-emerald-300 bg-emerald-50 text-gray-900'
                  : 'border-gray-200 bg-gray-50 text-gray-600'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Urgent SMS Alerts</span>
                <span className={`text-xs ${formData.notifications.smsUrgent ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>✓</span>
              </div>
              <p className="mt-1 text-[11px] text-gray-500">Critical notifications for major hardware faults.</p>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
