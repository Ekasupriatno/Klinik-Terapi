import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Bell,
  Calendar,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Stethoscope,
  ChevronDown,
  CheckCheck,
  Trash2
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isTherapist, isParent, logout } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    fetchNotifications,
  } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const mobileNotifRef = useRef(null);

  const canReceiveNotifications = isAuthenticated;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setUserMenuOpen(false);
    setNotificationsOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read_at) {
        await markAsRead(notification.id);
      }
    } catch (error) {
      console.error('Gagal menandai notifikasi telah dibaca:', error);
    }

    setNotificationsOpen(false);
    setMobileMenuOpen(false);

    if (isAdmin) {
      navigate('/admin');
    } else if (isTherapist) {
      navigate('/therapist');
    } else {
      navigate('/my-bookings');
    }
  };

  const isActive = (path) => location.pathname === path;

  // Simple, concise primary links
  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Layanan', path: '/services' },
    { name: 'Dokter', path: '/doctors' },
    { name: 'Artikel', path: '/articles' },
    { name: 'Kontak', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group select-none">
            <div className="h-11 w-11 rounded-2xl bg-brand-50 p-1.5 flex items-center justify-center border border-brand-100 shadow-sm group-hover:scale-105 group-hover:border-brand-300 transition-all duration-300 shrink-0">
              <img 
                src="/Alabina_Logo.webp" 
                alt="Logo Rumah Terapi Alabina"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight block leading-tight group-hover:text-brand-700 transition-colors">
                Rumah Terapi<span className="text-brand-600"> Alabina</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500 block tracking-wide">
                Klinik Tumbuh Kembang
              </span>
            </div>
          </Link>

          {/* Desktop Primary Nav Links (Simple & Clean) */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive(link.path)
                    ? 'text-brand-700 bg-brand-50 shadow-sm'
                    : 'text-slate-600 hover:text-brand-700 hover:bg-slate-100/70'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Quick Action: Reservasi Button */}
            <Link
              to="/booking"
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 ${
                isActive('/booking')
                  ? 'bg-brand-700 text-white shadow-brand-600/30 ring-2 ring-brand-500/30'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20'
              }`}
            >
              Reservasi
            </Link>

            {/* Notification Bell */}
            {canReceiveNotifications && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen((open) => !open);
                    setUserMenuOpen(false);
                  }}
                  className="relative p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-brand-700 hover:bg-brand-50 transition"
                  aria-label={`Notifikasi${unreadCount ? `, ${unreadCount} belum dibaca` : ''}`}
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-800">Notifikasi</h3>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                            {unreadCount} baru
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={() => markAllAsRead()}
                            className="text-[11px] font-semibold text-brand-600 hover:text-brand-800 transition flex items-center gap-1"
                            title="Tandai semua dibaca"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Tandai dibaca</span>
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            type="button"
                            onClick={() => clearAllNotifications()}
                            className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 transition flex items-center gap-0.5"
                            title="Hapus semua notifikasi"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>
                    </div>
                    {notifications.length > 0 ? (
                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`group relative flex items-start justify-between gap-2 px-4 py-3 hover:bg-slate-50 transition cursor-pointer ${
                              notification.read_at ? 'bg-white' : 'bg-brand-50/50'
                            }`}
                          >
                            <div
                              onClick={() => handleNotificationClick(notification)}
                              className="flex-1 min-w-0"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="block text-xs font-bold text-slate-800 truncate">
                                  {notification.data?.title || 'Notifikasi'}
                                </span>
                                {!notification.read_at && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0" />
                                )}
                              </div>
                              <span className="block mt-1 text-xs text-slate-600 leading-snug">
                                {notification.data?.message}
                              </span>
                              {notification.data?.appointment_date && (
                                <span className="block mt-1 text-[10px] text-slate-500 font-medium">
                                  Jadwal: {new Date(`${notification.data.appointment_date}T${notification.data.appointment_time || '00:00'}`).toLocaleString('id-ID')}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
                              title="Hapus notifikasi ini"
                              aria-label="Hapus notifikasi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="px-4 py-6 text-center text-xs text-slate-500">
                        Belum ada notifikasi.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Authenticated User Menu Dropdown */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen((open) => !open);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-slate-50 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="max-w-[130px]">
                    <div className="text-xs font-bold text-slate-800 truncate leading-tight">
                      {user?.name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate leading-none capitalize mt-0.5">
                      {isAdmin ? 'Administrator' : isTherapist ? 'Terapis' : 'Wali Pasien'}
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 py-1.5 animate-in fade-in slide-in-from-top-1">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email || 'Akun Terdaftar'}</p>
                    </div>

                    <div className="py-1">
                      {!isAdmin && (
                        <Link
                          to="/my-bookings"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition"
                        >
                          <Calendar className="w-4 h-4 text-brand-600" />
                          <span>Booking Saya</span>
                        </Link>
                      )}

                      {(isParent || (!isAdmin && !isTherapist)) && (
                        <Link
                          to="/parent"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition"
                        >
                          <UserIcon className="w-4 h-4 text-teal-600" />
                          <span>Portal Orang Tua</span>
                        </Link>
                      )}

                      {isTherapist && !isAdmin && (
                        <Link
                          to="/therapist"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                        >
                          <Stethoscope className="w-4 h-4 text-indigo-600" />
                          <span>Portal Terapis</span>
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-amber-800 hover:bg-amber-50 transition"
                        >
                          <ShieldAlert className="w-4 h-4 text-amber-600" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-brand-700 hover:bg-slate-100 transition"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-slate-50 transition"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Controls: Bell + Hamburger */}
          <div className="flex lg:hidden items-center gap-2" ref={mobileNotifRef}>
            {canReceiveNotifications && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen((open) => !open);
                    setMobileMenuOpen(false);
                    if (!notificationsOpen) fetchNotifications();
                  }}
                  className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100"
                  aria-label="Notifikasi"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Mobile Notification Dropdown */}
                {notificationsOpen && (
                  <div className="fixed inset-x-4 top-20 max-h-[75vh] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 flex flex-col animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-800">Notifikasi</h3>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                            {unreadCount} baru
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={() => markAllAsRead()}
                            className="text-[11px] font-bold text-brand-600 hover:text-brand-800"
                          >
                            Tandai dibaca
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            type="button"
                            onClick={() => clearAllNotifications()}
                            className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-0.5"
                            title="Hapus semua notifikasi"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setNotificationsOpen(false)}
                          className="text-slate-400 hover:text-slate-600 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`flex items-start justify-between gap-2 px-4 py-3 hover:bg-slate-50 transition cursor-pointer ${
                              notification.read_at ? 'bg-white' : 'bg-brand-50/60'
                            }`}
                          >
                            <div
                              onClick={() => handleNotificationClick(notification)}
                              className="flex-1 min-w-0"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="block text-xs font-bold text-slate-800 truncate">
                                  {notification.data?.title || 'Notifikasi'}
                                </span>
                                {!notification.read_at && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0" />
                                )}
                              </div>
                              <span className="block mt-1 text-xs text-slate-600 leading-snug">
                                {notification.data?.message}
                              </span>
                              {notification.data?.appointment_date && (
                                <span className="block mt-1 text-[10px] text-slate-500 font-medium">
                                  Jadwal: {new Date(`${notification.data.appointment_date}T${notification.data.appointment_time || '00:00'}`).toLocaleString('id-ID')}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
                              title="Hapus notifikasi"
                              aria-label="Hapus notifikasi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="px-4 py-8 text-center text-xs text-slate-500">
                          Belum ada notifikasi.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setNotificationsOpen(false);
              }}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-base font-semibold ${
                isActive(link.path)
                  ? 'text-brand-700 bg-brand-50'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {link.name}
            </Link>
          ))}

          <Link
            to="/booking"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-base font-bold text-brand-700 bg-brand-50"
          >
            Reservasi
          </Link>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-200/80 space-y-1">
              <div className="px-4 py-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Akun Saya
              </div>
              <div className="px-4 py-1 text-sm font-bold text-slate-800">
                {user?.name}
              </div>

              {!isAdmin && (
                <Link
                  to="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  📅 Booking Saya
                </Link>
              )}

              {(isParent || (!isAdmin && !isTherapist)) && (
                <Link
                  to="/parent"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-xl text-sm font-semibold text-teal-800 bg-teal-50"
                >
                  👨‍👩‍👧‍👦 Portal Orang Tua
                </Link>
              )}

              {isTherapist && !isAdmin && (
                <Link
                  to="/therapist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-xl text-sm font-semibold text-indigo-800 bg-indigo-50"
                >
                  🩺 Portal Terapis
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-xl text-sm font-semibold text-amber-800 bg-amber-50"
                >
                  🛡️ Admin Panel
                </Link>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-rose-600 font-semibold hover:bg-rose-50 flex items-center gap-2 mt-2"
              >
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-700"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-sm font-bold bg-brand-600 text-white"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
