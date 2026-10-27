import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Default to pre-logged in Admin with rich human profile fields
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smart_campus_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      id: 1,
      name: 'Dr. Evelyn Reed',
      email: 'admin@campus.edu',
      role: 'admin',
      department: 'Campus Infrastructure & Facilities Management',
      title: 'Director of Campus Infrastructure & Energy Operations',
      phone: '+1 (555) 019-2834',
      office: 'Oakridge Administration Block, Suite 302',
      bio: 'Overseeing sustainable campus transformation, renewable energy integration, and smart automated environmental controls across 4 academic blocks.',
      avatarColor: 'from-emerald-500 to-teal-600',
      notifications: {
        emailSpikes: true,
        dailyDigest: true,
        smsUrgent: false
      }
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('smart_campus_token') || 'demo_token_admin');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('smart_campus_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('smart_campus_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('smart_campus_token', token);
    } else {
      localStorage.removeItem('smart_campus_token');
    }
  }, [token]);

  // Fast Persona / Role Switcher for instant testing
  const switchRole = async (targetRole) => {
    setLoading(true);
    try {
      const res = await api.auth.demoLogin(targetRole);
      setUser(res.user);
      setToken(res.token);
    } catch (err) {
      console.warn('Switch role API fallback:', err.message);
      const mockProfiles = {
        admin: {
          id: 1,
          name: 'Dr. Evelyn Reed',
          email: 'admin@campus.edu',
          role: 'admin',
          department: 'Campus Infrastructure & Facilities Management',
          title: 'Director of Campus Infrastructure & Energy Operations',
          phone: '+1 (555) 019-2834',
          office: 'Oakridge Administration Block, Suite 302',
          bio: 'Overseeing sustainable campus transformation, renewable energy integration, and smart automated environmental controls across 4 academic blocks.',
          avatarColor: 'from-emerald-500 to-teal-600'
        },
        faculty: {
          id: 2,
          name: 'Prof. Sarah Jenkins',
          email: 'prof.sarah@campus.edu',
          role: 'faculty',
          department: 'Computer Science & Robotics',
          title: 'Associate Professor & AI Lab Director',
          phone: '+1 (555) 014-9921',
          office: 'Aryabhata Science Block, Room 304',
          bio: 'Leading the Autonomous Robotics & Embedded Systems Research Group.',
          avatarColor: 'from-cyan-500 to-blue-600'
        },
        student: {
          id: 3,
          name: 'Alex Rivera',
          email: 'alex.student@campus.edu',
          role: 'student',
          department: 'Electrical & Electronics Engineering',
          title: 'Senior Undergraduate Scholar & Eco-Ambassador',
          phone: '+1 (555) 012-3847',
          office: 'Central Library, Student Lounge',
          bio: 'Senior student researcher focusing on solar PV performance and microgrid load optimization.',
          avatarColor: 'from-amber-500 to-orange-600'
        }
      };
      setUser(mockProfiles[targetRole] || mockProfiles.admin);
      setToken(`demo_token_${targetRole}`);
    } finally {
      setLoading(false);
    }
  };

  // Editable Profile Update Function
  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      try {
        const res = await api.auth.updateProfile(profileData);
        if (res.user) {
          setUser(prev => ({ ...prev, ...res.user }));
        }
        if (res.token) setToken(res.token);
        return res;
      } catch (err) {
        // Fallback local update
        console.warn('API update failed, updating locally:', err.message);
        setUser(prev => ({ ...prev, ...profileData }));
        return { message: 'Profile updated locally!', user: { ...user, ...profileData } };
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      setUser(res.user);
      setToken(res.token);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smart_campus_user');
    localStorage.removeItem('smart_campus_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'student',
        token,
        loading,
        login,
        logout,
        switchRole,
        updateProfile,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
