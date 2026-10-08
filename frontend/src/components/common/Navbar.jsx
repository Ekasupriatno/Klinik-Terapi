import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/api';
import {
  Activity,
  Bell,
  Calendar,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Stethoscope,
  PhoneCall
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isTherapist, isParent, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const canReceiveNotifications = isAuthenticated && !isAdmin && !isTherapist;

  useEffect(() => {
    if (!canReceiveNotifications) {
      setNotifications([]);
      setUnreadCount(0);
      return undefined;
    }

    let active = true;
    const fetchNotifications = async () => {
      try {
        const response = await notificationService.getAll();
        if (active && response.data?.success) {
          setNotifications(response.data.data || []);
          setUnreadCount(response.data.unread_count || 0);
        }
      } catch (error) {
        if (active) {
          console.error('Gagal mengambil notifikasi:', error);
        }
      }
    };

    fetchNotifications();
    const intervalId = window.setInterval(fetchNotifications, 30000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [canReceiveNotifications]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read_at) {
        await notificationService.markAsRead(notification.id);
        setNotifications((current) => current.map((item) => (
          item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item
        )));
        setUnreadCount((count) => Math.max(0, count - 1));
      }
    } catch (error) {
      console.error('Gagal menandai notifikasi telah dibaca:', error);
    }

    setNotificationsOpen(false);
    setMobileMenuOpen(false);
    navigate('/my-bookings');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Layanan Terapi', path: '/services' },
    { name: 'Artikel Edukasi', path: '/articles' },
    { name: 'Dokter Terapi', path: '/doctors' },
    { name: 'Reservasi', path: '/booking' },
    { name: 'Kontak', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/public/Alabina_logo.webp" 
              alt="Alabina Logo"
              className="h-12 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight block leading-tight">
                Rumah Terapi<span className="text-brand-600"> Alabina</span>
              </span>
              <span className="text-xs font-medium text-slate-500 block tracking-wide">
                Klinik Tumbuh Kembang
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive(link.path)
                    ? 'text-brand-700 bg-brand-50'
                    : 'text-slate-600 hover:text-brand-600 hover:bg-slate-100/70'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated && (
              <>
                {/* Parent Portal */}
                {(isParent || (!isAdmin && !isTherapist)) && (
                  <Link
                    to="/parent"
                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      location.pathname.startsWith('/parent')
                        ? 'text-teal-700 bg-teal-50'
                        : 'text-slate-600 hover:text-teal-600 hover:bg-slate-100/70'
                    }`}
                  >
                    <span>Portal Ortu</span>
                  </Link>
                )}

                {/* Therapist Portal */}
                {(isTherapist || isAdmin) && (
                  <Link
                    to="/therapist"
                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      location.pathname.startsWith('/therapist')
                        ? 'text-indigo-700 bg-indigo-50'
                        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100/70'
                    }`}
                  >
                    <span>Portal Terapis</span>
                  </Link>
                )}

                {/* Patient / Parent Bookings */}
                {!isAdmin && (
                  <Link
                    to="/my-bookings"
                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      isActive('/my-bookings')
                        ? 'text-brand-700 bg-brand-50'
                        : 'text-slate-600 hover:text-brand-600 hover:bg-slate-100/70'
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-brand-600" />
                    <span>Booking Saya</span>
                  </Link>
                )}

                {/* Admin Dashboard */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      isActive('/admin')
                        ? 'text-amber-800 bg-amber-100'
                        : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Admin Panel</span>
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-800 leading-tight">
                    {user?.name}
                  </div>
                  <div className="text-xs text-slate-500 capitalize">
                    {isAdmin ? '🛡️ Administrator' : isTherapist ? '🩺 Terapis' : 'Orang Tua / Pasien'}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:text-brand-700 hover:bg-slate-100 transition"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/25 transition active:scale-95"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canReceiveNotifications && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((open) => !open)}
                  className="relative p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-brand-700 hover:bg-brand-50 transition"
                  aria-label={`Notifikasi${unreadCount ? `, ${unreadCount} belum dibaca` : ''}`}
                  aria-expanded={notificationsOpen}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800">Notifikasi</h3>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-1 rounded-full">
                          {unreadCount} baru
                        </span>
                      )}
                    </div>
                    {notifications.length > 0 ? (
                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.map((notification) => (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() => handleNotificationClick(notification)}
                            className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition ${
                              notification.read_at ? 'bg-white' : 'bg-brand-50/50'
                            }`}
                          >
                            <span className="block text-xs font-bold text-slate-800">
                              {notification.data?.title || 'Notifikasi'}
                            </span>
                            <span className="block mt-1 text-xs text-slate-600">
                              {notification.data?.message}
                            </span>
                            {notification.data?.appointment_date && (
                              <span className="block mt-1 text-[10px] text-slate-500">
                                Jadwal: {new Date(`${notification.data.appointment_date}T${notification.data.appointment_time || '00:00'}`).toLocaleString('id-ID')}
                              </span>
                            )}
                          </button>
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

            {/* Mobile Hamburger Toggle */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
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

          {isAuthenticated && (
            <>
              {(isParent || (!isAdmin && !isTherapist)) && (
                <Link
                  to="/parent"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-base font-semibold text-teal-800 bg-teal-50"
                >
                  👨‍👩‍👧‍👦 Portal Orang Tua
                </Link>
              )}

              {(isTherapist || isAdmin) && (
                <Link
                  to="/therapist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-base font-semibold text-indigo-800 bg-indigo-50"
                >
                  🩺 Portal Terapis
                </Link>
              )}

              {!isAdmin && (
                <Link
                  to="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-100"
                >
                  📅 Booking Saya
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-base font-semibold text-amber-800 bg-amber-50"
                >
                  🛡️ Admin Dashboard
                </Link>
              )}
            </>
          )}

          <div className="pt-4 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-4 text-sm font-semibold text-slate-800">
                  {user?.name} ({user?.role})
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-rose-600 font-semibold hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
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
        </div>
      )}
    </header>
  );
};
