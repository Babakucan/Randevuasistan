'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { capitalizeName } from '@/lib/utils';
import { authApi, dashboardApi, customersApi, servicesApi, employeesApi, appointmentsApi, removeToken, getToken, getCurrentSalonId, setCurrentSalonId } from '@/lib/api';
import Link from 'next/link';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Clock, 
  User,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  Eye,
  Phone,
  MessageCircle,
  BarChart3,
  Building,
  ChevronDown
} from 'lucide-react';

interface RecentActivity {
  id: string;
  type: 'appointment' | 'customer' | 'employee' | 'service';
  description: string;
  details: string;
  timestamp: string;
  created_at: string;
}

interface Notification {
  id: string;
  type: 'new_customer' | 'new_appointment';
  title: string;
  message: string;
  created_at: string;
  target_id: string;
}

interface ChartData {
  labels: string[];
  data: number[];
  colors: string[];
}

interface AppointmentNotification {
  id: string;
  customerName: string;
  serviceName: string;
  employeeName: string;
  appointmentTime: string;
  appointmentDate: string;
  status: string;
  salonId: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalCustomers: 0,
    totalEmployees: 0,
    totalServices: 0,
    todayAppointments: 0,
    todayEarnings: 0,
    thisWeekAppointments: 0,
    thisMonthEarnings: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showQuickAppointment, setShowQuickAppointment] = useState(false);
  const [showQuickCustomer, setShowQuickCustomer] = useState(false);
  const [showQuickEmployee, setShowQuickEmployee] = useState(false);
  const [showQuickService, setShowQuickService] = useState(false);
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [appointmentNotifications, setAppointmentNotifications] = useState<AppointmentNotification[]>([]);
  const [showSalonDropdown, setShowSalonDropdown] = useState(false);

  const [weeklyData, setWeeklyData] = useState<ChartData>({ labels: [], data: [], colors: [] });
  const [serviceData, setServiceData] = useState<ChartData>({ labels: [], data: [], colors: [] });
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerEarnings, setCustomerEarnings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [quickAppointmentData, setQuickAppointmentData] = useState({
    customerName: '',
    customerPhone: '',
    service: '',
    employee: '',
    date: '',
    time: ''
  });

  // Quick Customer Modal Data
  const [quickCustomerData, setQuickCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  // Quick Employee Modal Data
  const [quickEmployeeData, setQuickEmployeeData] = useState({
    name: '',
    position: '',
    phone: '',
    email: '',
    specialties: [] as string[]
  });

  // Quick Service Modal Data
  const [quickServiceData, setQuickServiceData] = useState({
    name: '',
    price: '',
    duration: '',
    description: ''
  });



  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showNotifications && !target.closest('.notifications-dropdown')) {
        setShowNotifications(false);
      }
      if (!target.closest('.profile-menu')) {
        setShowProfileMenu(false);
      }
      if (showSalonDropdown && !target.closest('.salon-dropdown')) {
        setShowSalonDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const checkUser = async () => {
    try {
      const token = getToken();
      if (!token) {
        router.push('/login');
        setLoading(false);
        return;
      }
      const user = await authApi.getCurrentUser();
      if (user) {
        setUser(user);
        
        // Salon profil kontrolü ve currentSalonId ayarlama
        if (user.salonProfiles && user.salonProfiles.length > 0) {
          let salonId = getCurrentSalonId();
          
          // Eğer currentSalonId yoksa veya geçersizse, ilk salon profilini kullan
          if (!salonId || !user.salonProfiles.find(sp => sp.id === salonId)) {
            salonId = user.salonProfiles[0].id;
            // ÖNEMLİ: setCurrentSalonId'yi API çağrılarından ÖNCE yap
            setCurrentSalonId(salonId);
          }
          
          // User geldikten sonra verileri yükle
          try {
            await Promise.all([
              loadStats(salonId),
              loadRecentActivities(salonId),
              loadQuickAppointmentData(salonId),
            ]);
          } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Hata olsa bile loading'i kapat
          }
        } else {
          console.error('No salon profiles found for user');
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
      removeToken();
      router.push('/login');
    } finally {
      // Her durumda loading'i kapat
      setLoading(false);
    }
  };

  const loadDashboardData = async (userId: string) => {
    try {
      // Bu fonksiyon artık kullanılmıyor, checkUser içinde yapılıyor
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (salonId?: string) => {
    try {
      const statsData = await dashboardApi.getStats();
      if (statsData) {
        setStats({
          totalAppointments: statsData.totalAppointments || 0,
          totalCustomers: statsData.totalCustomers || 0,
          totalEmployees: statsData.totalEmployees || 0,
          totalServices: statsData.totalServices || 0,
          todayAppointments: statsData.todayAppointments || 0,
          todayEarnings: statsData.todayEarnings || 0,
          thisWeekAppointments: statsData.thisWeekAppointments || 0,
          thisMonthEarnings: statsData.thisMonthEarnings || 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        totalAppointments: 0,
        totalCustomers: 0,
        totalEmployees: 0,
        totalServices: 0,
        todayAppointments: 0,
        todayEarnings: 0,
        thisWeekAppointments: 0,
        thisMonthEarnings: 0
      });
    }
  };

  const loadRecentActivities = async (salonId?: string) => {
    try {
      const activities = await dashboardApi.getActivities();
      if (activities && Array.isArray(activities)) {
        setRecentActivities(activities.map(activity => ({
          id: activity.id,
          type: activity.type,
          description: activity.description,
          details: activity.details || '',
          timestamp: activity.timestamp || activity.created_at,
          created_at: activity.created_at || activity.timestamp,
        })));
      } else {
        setRecentActivities([]);
      }
    } catch (error) {
      console.error('Error loading recent activities:', error);
      setRecentActivities([]);
    }
  };

  const loadNotifications = async (salonId: string) => {
    try {
      // TODO: Implement notifications loading with new backend
      setNotifications([]);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadChartData = async (salonId: string) => {
    try {
      // TODO: Implement chart data loading with new backend
      setWeeklyData({ labels: [], data: [], colors: [] });
      setServiceData({ labels: [], data: [], colors: [] });
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  };

  const loadAppointmentNotifications = async (salonId: string) => {
    try {
      // TODO: Implement appointment notifications loading with new backend
      setAppointmentNotifications([]);
    } catch (error) {
      console.error('Error loading appointment notifications:', error);
    }
  };

  const handleAppointmentConfirm = async (appointmentId: string) => {
    try {
      // TODO: Implement appointment confirmation with new backend
      setAppointmentNotifications(prev => 
        prev.filter(notification => notification.id !== appointmentId)
      );
    } catch (error) {
      console.error('Error confirming appointment:', error);
    }
  };

  const loadQuickAppointmentData = async (salonId: string) => {
    try {
      const [customersData, servicesData, employeesData] = await Promise.all([
        customersApi.getAll(),
        servicesApi.getAll(),
        employeesApi.getAll(),
      ]);
      setCustomers(customersData || []);
      setServices(servicesData || []);
      setEmployees(employeesData || []);
    } catch (error) {
      console.error('Error loading quick appointment data:', error);
      setCustomers([]);
      setServices([]);
      setEmployees([]);
    }
  };

  const loadCustomerEarnings = async (salonId: string) => {
    try {
      // TODO: Implement customer earnings loading with new backend
      setCustomerEarnings([]);
    } catch (error) {
      console.error('Error loading customer earnings:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      removeToken();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleActivityClick = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'appointment':
        router.push(`/appointments/${activity.id}`);
        break;
      case 'customer':
        router.push(`/customers/${activity.id}`);
        break;
      case 'employee':
        router.push(`/employees/${activity.id}`);
        break;
      case 'service':
        router.push(`/services/${activity.id}`);
        break;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    switch (notification.type) {
      case 'new_customer':
        router.push(`/customers/${notification.target_id}`);
        break;
      case 'new_appointment':
        router.push(`/appointments/${notification.target_id}`);
        break;
    }
    setShowNotifications(false);
  };

  // Quick Appointment Add Function
  const handleQuickAppointmentAdd = async () => {
    try {
      if (!user) return;
      
      // Validation
      if (!quickAppointmentData.customerName || !quickAppointmentData.service || !quickAppointmentData.date || !quickAppointmentData.time) {
        alert('Lütfen tüm gerekli alanları doldurun!');
        return;
      }

      // TODO: Implement quick appointment creation with new backend
      alert('Backend entegrasyonu henüz tamamlanmadı');
      
      // Reset form
      setQuickAppointmentData({
        customerName: '',
        customerPhone: '',
        service: '',
        employee: '',
        date: '',
        time: ''
      });
      setSelectedCustomer(null);
      setCustomerSearchTerm('');
      setShowQuickAppointment(false);
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Randevu oluşturulurken hata oluştu!');
    }
  };

  // Quick Customer Add Function
  const handleQuickCustomerAdd = async () => {
    try {
      if (!user) return;
      
      // TODO: Implement quick customer creation with new backend
      alert('Backend entegrasyonu henüz tamamlanmadı');
      
      setQuickCustomerData({ name: '', phone: '', email: '', notes: '' });
      setShowQuickCustomer(false);
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('Müşteri eklenirken hata oluştu!');
    }
  };

  // Quick Employee Add Function
  const handleQuickEmployeeAdd = async () => {
    try {
      if (!user) return;
      
      // TODO: Implement quick employee creation with new backend
      alert('Backend entegrasyonu henüz tamamlanmadı');
      
      setQuickEmployeeData({ name: '', position: '', phone: '', email: '', specialties: [] });
      setShowQuickEmployee(false);
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Çalışan eklenirken hata oluştu!');
    }
  };

  // Quick Service Add Function
  const handleQuickServiceAdd = async () => {
    try {
      if (!user) return;
      
      // TODO: Implement quick service creation with new backend
      alert('Backend entegrasyonu henüz tamamlanmadı');
      
      setQuickServiceData({ name: '', price: '', duration: '', description: '' });
      setShowQuickService(false);
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Hizmet eklenirken hata oluştu!');
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
          <span className="text-gray-300">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {/* Salon Selector */}
              <div className="relative salon-dropdown">
                <button
                  onClick={() => setShowSalonDropdown(!showSalonDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Building className="w-4 h-4 text-gray-300" />
                  <span className="text-white font-medium">
                    {user?.salonProfiles?.find(sp => sp.id === getCurrentSalonId())?.name || 
                     user?.salonProfiles?.[0]?.name || 'Salon'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-300" />
                </button>
                
                {showSalonDropdown && user?.salonProfiles && (
                  <div className="absolute left-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-[9999]">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-700">
                        <div className="text-xs text-gray-400 mb-1">Aktif Salon</div>
                        <div className="text-sm text-white font-medium">
                          {user.salonProfiles.find(sp => sp.id === getCurrentSalonId())?.name || 
                           user.salonProfiles[0]?.name}
                        </div>
                      </div>
                      {user.salonProfiles.map((salon) => (
                        <button
                          key={salon.id}
                          onClick={() => {
                            setCurrentSalonId(salon.id);
                            setShowSalonDropdown(false);
                            window.location.reload();
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            getCurrentSalonId() === salon.id
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{salon.name}</span>
                            {getCurrentSalonId() === salon.id && (
                              <span className="text-xs">✓</span>
                            )}
                          </div>
                        </button>
                      ))}
                      <div className="border-t border-gray-700 mt-2 pt-2">
                        <Link
                          href="/salons"
                          onClick={() => setShowSalonDropdown(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Salon Yönetimi</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">Yönetim Paneli</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative notifications-dropdown z-[9998]">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors z-30"
                >
                  <Bell className="w-5 h-5 text-gray-300" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-[9999] max-h-96 overflow-hidden">
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-3">Bildirimler</h3>
                      {notifications.length === 0 ? (
                        <p className="text-gray-400 text-sm">Yeni bildirim yok</p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {notifications.map((notification) => (
                            <button
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-white font-medium text-sm truncate">{notification.title}</h4>
                                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">{notification.message}</p>
                                  <p className="text-gray-500 text-xs mt-2">
                                    {new Date(notification.created_at).toLocaleString('tr-TR')}
                                  </p>
                                </div>
                                <Eye className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Menu */}
              <div className="relative profile-menu z-[9998]">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors z-30"
                >
                  <User className="w-5 h-5 text-gray-300" />
                </button>
                
                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-[9999]">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-700">
                        <div className="text-sm text-gray-300">{user?.email}</div>
                        <div className="text-xs text-gray-500">Yönetici</div>
                      </div>
                      <button
                        onClick={() => router.push('/appointments')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        Randevular
                      </button>
                      <button
                        onClick={() => router.push('/employees')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        Çalışanlar
                      </button>
                      <button
                        onClick={() => router.push('/customers')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        Müşteriler
                      </button>
                      <button
                        onClick={() => router.push('/services')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        Hizmetler
                      </button>
                      <button
                        onClick={() => router.push('/salons')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        <Building className="w-4 h-4 inline mr-2" />
                        Salon Yönetimi
                      </button>
                      <div className="border-t border-gray-700 mt-2 pt-2">
              <button
                onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
              >
                          Çıkış Yap
              </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

        {/* Main Content */}
        <div className="flex-1 p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h1 className="text-3xl font-bold text-white text-center">
              Hoş Geldiniz
          </h1>
            <p className="text-gray-300 text-center mt-2">
              {user?.salonProfiles?.[0]?.name || 'Salon'} Salonunuzun Yönetim Paneli
          </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <button 
            onClick={() => router.push('/appointments')}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.totalAppointments}</div>
              <div className="text-gray-400 text-sm">Toplam Randevu</div>
            </div>
          </button>

          <button 
            onClick={() => router.push('/customers')}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.totalCustomers}</div>
              <div className="text-gray-400 text-sm">Toplam Müşteri</div>
            </div>
          </button>

          <button 
            onClick={() => router.push('/employees')}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.totalEmployees}</div>
              <div className="text-gray-400 text-sm">Çalışan</div>
            </div>
          </button>

          <button 
            onClick={() => router.push('/services')}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Settings className="w-7 h-7 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.totalServices}</div>
              <div className="text-gray-400 text-sm">Hizmet</div>
            </div>
          </button>

          <button 
            onClick={() => setShowEarningsModal(true)}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.todayEarnings} ₺</div>
              <div className="text-gray-400 text-sm">Bugünkü Kazanç</div>
            </div>
          </button>
        </div>



        {/* Recent Activities and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Son Aktiviteler</h2>
              <div className="space-y-3">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => {
                    // Aktivite türüne göre ikon ve renk belirle
                    let icon, bgColor;
                    switch (activity.type) {
                      case 'appointment':
                        icon = <Calendar className="w-4 h-4 text-white" />;
                        bgColor = 'bg-blue-500';
                        break;
                      case 'customer':
                        icon = <Users className="w-4 h-4 text-white" />;
                        bgColor = 'bg-green-500';
                        break;
                      case 'employee':
                        icon = <User className="w-4 h-4 text-white" />;
                        bgColor = 'bg-orange-500';
                        break;
                      case 'service':
                        icon = <Settings className="w-4 h-4 text-white" />;
                        bgColor = 'bg-purple-500';
                        break;
                      default:
                        icon = <Clock className="w-4 h-4 text-white" />;
                        bgColor = 'bg-gray-500';
                    }

                    return (
                      <button
                        key={activity.id}
                        onClick={() => handleActivityClick(activity)}
                        className="w-full text-left flex items-start space-x-3 p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors group"
                      >
                        <div className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center mt-1`}>
                          {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-200 text-sm font-medium">{activity.description}</p>
                          <p className="text-gray-400 text-xs mt-1">{activity.details}</p>
                          <p className="text-gray-500 text-xs mt-1">{activity.timestamp}</p>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors mt-1" />
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">Henüz aktivite yok</p>
                  </div>
                )}
                 </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Hızlı İşlemler</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowQuickAppointment(true)}
                  className="w-full flex items-center space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center group-hover:bg-blue-400 transition-colors">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-gray-200 group-hover:text-white transition-colors font-medium">Yeni Randevu</span>
                </button>

                <button 
                  onClick={() => setShowQuickCustomer(true)}
                  className="w-full flex items-center space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center group-hover:bg-green-400 transition-colors">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-gray-200 group-hover:text-white transition-colors font-medium">Yeni Müşteri</span>
                </button>

                <button 
                  onClick={() => setShowQuickEmployee(true)}
                  className="w-full flex items-center space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                >
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center group-hover:bg-orange-400 transition-colors">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-gray-200 group-hover:text-white transition-colors font-medium">Yeni Çalışan</span>
                </button>

                <button 
                  onClick={() => setShowQuickService(true)}
                  className="w-full flex items-center space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                >
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center group-hover:bg-purple-400 transition-colors">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-gray-200 group-hover:text-white transition-colors font-medium">Yeni Hizmet</span>
                </button>

                <button 
                  onClick={() => router.push('/phone-calls')}
                  className="w-full flex items-center space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                >
                  <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center group-hover:bg-red-400 transition-colors">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-gray-200 group-hover:text-white transition-colors font-medium">Telefon Aramaları</span>
                </button>

                <button 
                  onClick={() => router.push('/whatsapp')}
                  className="w-full flex items-center space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center group-hover:bg-green-400 transition-colors">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-gray-200 group-hover:text-white transition-colors font-medium">WhatsApp Mesajları</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Chart */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Haftalık Randevular
              </h2>
              <span className="text-sm text-gray-400">Son 7 gün</span>
            </div>
            <div className="space-y-3">
              {weeklyData.labels.map((label, index) => (
                <div key={label} className="flex items-center space-x-3">
                  <div className="w-12 text-sm text-gray-300">{label}</div>
                  <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${weeklyData.data[index] > 0 ? (weeklyData.data[index] / Math.max(...weeklyData.data)) * 100 : 0}%`,
                        backgroundColor: weeklyData.colors[index]
                      }}
                    />
                  </div>
                  <div className="w-8 text-sm text-gray-300 text-right">{weeklyData.data[index]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Chart */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Hizmet Dağılımı
              </h2>
              <span className="text-sm text-gray-400">Toplam: {serviceData.data.reduce((a, b) => a + b, 0)}</span>
            </div>
            <div className="space-y-3">
              {serviceData.labels.map((label, index) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: serviceData.colors[index] }}
                    />
                    <span className="text-gray-300 text-sm">{label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold">{serviceData.data[index]}</span>
                    <span className="text-gray-400 text-xs">
                      ({((serviceData.data[index] / serviceData.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Sistem Durumu</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                  <span className="text-gray-200">Veritabanı</span>
                </div>
                <span className="text-emerald-400 text-sm font-medium">Aktif</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                  <span className="text-gray-200">Kimlik Doğrulama</span>
                </div>
                <span className="text-emerald-400 text-sm font-medium">Aktif</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                  <span className="text-gray-200">API</span>
                </div>
                <span className="text-emerald-400 text-sm font-medium">Aktif</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                  <span className="text-gray-200">Bildirimler</span>
                </div>
                <span className="text-emerald-400 text-sm font-medium">Aktif</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Statistics Modal */}
      {showEarningsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Kazanç İstatistikleri</h2>
              <button
                onClick={() => setShowEarningsModal(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Bugünkü İstatistikler */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  Bugün
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Toplam Kazanç:</span>
                    <span className="text-white font-semibold">{stats.todayEarnings} ₺</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Randevu Sayısı:</span>
                    <span className="text-white font-semibold">{stats.todayAppointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Ortalama:</span>
                    <span className="text-white font-semibold">
                      {stats.todayAppointments > 0 ? (stats.todayEarnings / stats.todayAppointments).toFixed(2) : 0} ₺
                    </span>
                  </div>
                </div>
              </div>

              {/* Bu Hafta İstatistikler */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Bu Hafta
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Toplam Kazanç:</span>
                    <span className="text-white font-semibold">{stats.thisMonthEarnings} ₺</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Randevu Sayısı:</span>
                    <span className="text-white font-semibold">{stats.thisWeekAppointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Ortalama:</span>
                    <span className="text-white font-semibold">
                      {stats.thisWeekAppointments > 0 ? (stats.thisMonthEarnings / stats.thisWeekAppointments).toFixed(2) : 0} ₺
                    </span>
                  </div>
                </div>
              </div>

              {/* Bu Ay İstatistikler */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  Bu Ay
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Toplam Kazanç:</span>
                    <span className="text-white font-semibold">{stats.thisMonthEarnings} ₺</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Randevu Sayısı:</span>
                    <span className="text-white font-semibold">{stats.totalAppointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Ortalama:</span>
                    <span className="text-white font-semibold">
                      {stats.totalAppointments > 0 ? (stats.thisMonthEarnings / stats.totalAppointments).toFixed(2) : 0} ₺
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hizmet Bazlı Kazanç Dağılımı */}
            <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-400" />
                Hizmet Bazlı Kazanç Dağılımı
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {serviceData.labels.map((service, index) => (
                  <div key={service} className="bg-gray-600/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">{service}</span>
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: serviceData.colors[index] }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Randevu:</span>
                      <span className="text-white">{serviceData.data[index]}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Oran:</span>
                      <span className="text-white">
                        {((serviceData.data[index] / serviceData.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Müşteri Bazlı Kazanç Analizi */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                Müşteri Bazlı Kazanç Analizi
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-2 text-gray-300">Müşteri</th>
                      <th className="text-left py-2 text-gray-300">Toplam Randevu</th>
                      <th className="text-left py-2 text-gray-300">Toplam Kazanç</th>
                      <th className="text-left py-2 text-gray-300">Ortalama</th>
                      <th className="text-left py-2 text-gray-300">Son Randevu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerEarnings.length > 0 ? (
                      customerEarnings.slice(0, 10).map((customer: any) => (
                        <tr key={customer.id} className="border-b border-gray-700/50 hover:bg-gray-600/30">
                          <td className="py-2 text-white">{customer.name}</td>
                          <td className="py-2 text-gray-300">{customer.totalAppointments}</td>
                          <td className="py-2 text-gray-300">{customer.totalEarnings.toFixed(2)} ₺</td>
                          <td className="py-2 text-gray-300">{customer.averageEarnings.toFixed(2)} ₺</td>
                          <td className="py-2 text-gray-300">
                            {customer.lastAppointment 
                              ? new Date(customer.lastAppointment).toLocaleDateString('tr-TR')
                              : 'Henüz randevu yok'
                            }
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-gray-400">
                          Henüz tamamlanmış randevu bulunmuyor
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                * Sadece tamamlanmış randevular gösterilmektedir. En çok kazandıran müşteriler üstte listelenir.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Appointment Modal */}
      {showQuickAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Hızlı Randevu</h2>
              <button
                onClick={() => setShowQuickAppointment(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Customer Search */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Müşteri
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Müşteri ara veya seçin..."
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                    onFocus={() => setShowCustomerDropdown(true)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  {/* Search Icon */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  {/* Dropdown */}
                  {showCustomerDropdown && customerSearchTerm && (
                    <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {customers.filter(customer =>
                        customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                        customer.phone?.includes(customerSearchTerm)
                      ).length === 0 ? (
                        <div className="p-3 text-sm text-gray-400">
                          Müşteri bulunamadı
                        </div>
                      ) : (
                        customers.filter(customer =>
                          customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                          customer.phone?.includes(customerSearchTerm)
                        ).map((customer: any) => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setCustomerSearchTerm(customer.name);
                              setQuickAppointmentData(prev => ({
                                ...prev,
                                customerName: customer.name,
                                customerPhone: customer.phone || ''
                              }));
                              setShowCustomerDropdown(false);
                            }}
                            className="w-full text-left p-3 hover:bg-gray-600 border-b border-gray-600 last:border-b-0"
                          >
                            <div className="font-medium text-white">
                              {customer.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {customer.phone}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                
                {/* Alternative: Dropdown for quick selection */}
                <div className="mt-2">
                  <select
                    onChange={(e) => {
                      const selectedCustomer = customers.find(c => c.id === e.target.value);
                      if (selectedCustomer) {
                        setSelectedCustomer(selectedCustomer);
                        setCustomerSearchTerm(selectedCustomer.name);
                        setQuickAppointmentData(prev => ({
                          ...prev,
                          customerName: selectedCustomer.name,
                          customerPhone: selectedCustomer.phone || ''
                        }));
                      }
                    }}
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Veya listeden seçin</option>
                    {customers.map((customer: any) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Service Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hizmet
                </label>
                <select 
                  value={quickAppointmentData.service}
                  onChange={(e) => setQuickAppointmentData(prev => ({ ...prev, service: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Hizmet seçin</option>
                  {services.map((service: any) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.duration} dk - {service.price} TL
                    </option>
                  ))}
                </select>
              </div>

              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Çalışan (Opsiyonel)
                </label>
                <select 
                  value={quickAppointmentData.employee}
                  onChange={(e) => setQuickAppointmentData(prev => ({ ...prev, employee: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Çalışan seçin (opsiyonel)</option>
                  {employees.map((employee: any) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} - {employee.position}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tarih
                  </label>
                  <input
                    type="date"
                    value={quickAppointmentData.date}
                    onChange={(e) => setQuickAppointmentData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Saat
                  </label>
                  <input
                    type="time"
                    value={quickAppointmentData.time}
                    onChange={(e) => setQuickAppointmentData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Selected Customer Info */}
              {selectedCustomer && (
                <div className="p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-300">Seçili Müşteri</span>
                  </div>
                  <div className="space-y-1 text-sm text-blue-200">
                    <div><strong>Ad:</strong> {selectedCustomer.name}</div>
                    {selectedCustomer.phone && <div><strong>Telefon:</strong> {selectedCustomer.phone}</div>}
                    {selectedCustomer.email && <div><strong>E-posta:</strong> {selectedCustomer.email}</div>}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowQuickAppointment(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleQuickAppointmentAdd}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Oluştur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Customer Modal */}
      {showQuickCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Hızlı Müşteri Ekleme</h2>
              <button
                onClick={() => setShowQuickCustomer(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Müşteri Adı
                </label>
                <input
                  type="text"
                  placeholder="Müşteri adını girin"
                  value={quickCustomerData.name}
                  onChange={(e) => setQuickCustomerData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  placeholder="Telefon numarası"
                  value={quickCustomerData.phone}
                  onChange={(e) => setQuickCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-posta (Opsiyonel)
                </label>
                <input
                  type="email"
                  placeholder="E-posta adresi"
                  value={quickCustomerData.email}
                  onChange={(e) => setQuickCustomerData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notlar (Opsiyonel)
                </label>
                <textarea
                  placeholder="Müşteri hakkında notlar..."
                  rows={3}
                  value={quickCustomerData.notes}
                  onChange={(e) => setQuickCustomerData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowQuickCustomer(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleQuickCustomerAdd}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Employee Modal */}
      {showQuickEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Hızlı Çalışan Ekleme</h2>
              <button
                onClick={() => setShowQuickEmployee(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Çalışan Adı
                </label>
                <input
                  type="text"
                  placeholder="Çalışan adını girin"
                  value={quickEmployeeData.name}
                  onChange={(e) => setQuickEmployeeData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pozisyon
                </label>
                <input
                  type="text"
                  placeholder="Pozisyon"
                  value={quickEmployeeData.position}
                  onChange={(e) => setQuickEmployeeData(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  placeholder="Telefon numarası"
                  value={quickEmployeeData.phone}
                  onChange={(e) => setQuickEmployeeData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  placeholder="E-posta adresi"
                  value={quickEmployeeData.email}
                  onChange={(e) => setQuickEmployeeData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Verebileceği Hizmetler
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto bg-gray-700 border border-gray-600 rounded-lg p-3">
                  {services.map((service: any) => (
                    <label key={service.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={quickEmployeeData.specialties?.includes(service.id) || false}
                        onChange={(e) => {
                          const currentSpecialties = quickEmployeeData.specialties || [];
                          if (e.target.checked) {
                            setQuickEmployeeData(prev => ({
                              ...prev,
                              specialties: [...currentSpecialties, service.id]
                            }));
                          } else {
                            setQuickEmployeeData(prev => ({
                              ...prev,
                              specialties: currentSpecialties.filter(id => id !== service.id)
                            }));
                          }
                        }}
                        className="w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="text-gray-300 text-sm">
                        {service.name} - {service.price} TL
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Çalışanın verebileceği hizmetleri seçin
                </p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowQuickEmployee(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleQuickEmployeeAdd}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Service Modal */}
      {showQuickService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Hızlı Hizmet Ekleme</h2>
              <button
                onClick={() => setShowQuickService(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hizmet Adı
                </label>
                <input
                  type="text"
                  placeholder="Hizmet adını girin"
                  value={quickServiceData.name}
                  onChange={(e) => setQuickServiceData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fiyat (TL)
                </label>
                <input
                  type="number"
                  placeholder="Fiyat"
                  value={quickServiceData.price}
                  onChange={(e) => setQuickServiceData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Süre (Dakika)
                </label>
                <input
                  type="number"
                  placeholder="Süre"
                  value={quickServiceData.duration}
                  onChange={(e) => setQuickServiceData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Açıklama (Opsiyonel)
                </label>
                <textarea
                  placeholder="Hizmet açıklaması..."
                  rows={3}
                  value={quickServiceData.description}
                  onChange={(e) => setQuickServiceData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowQuickService(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleQuickServiceAdd}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Notifications */}
      {appointmentNotifications.length > 0 && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-400" />
                Yaklaşan Randevular
              </h2>
              <span className="text-sm text-orange-300 bg-orange-500/20 px-2 py-1 rounded-full">
                {appointmentNotifications.length} randevu
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appointmentNotifications.map((notification) => (
                <div key={notification.id} className="bg-gray-800/50 border border-orange-500/30 rounded-lg p-4 hover:bg-gray-800/70 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-sm mb-1">
                        {notification.customerName}
                      </h3>
                      <p className="text-gray-300 text-xs mb-1">
                        {notification.serviceName}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {notification.employeeName}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-orange-400 font-bold text-sm">
                        {notification.appointmentTime}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {notification.appointmentDate}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      notification.status === 'confirmed' 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {notification.status === 'confirmed' ? 'Onaylandı' : 'Beklemede'}
                    </span>
                    <button
                      onClick={() => handleAppointmentConfirm(notification.id)}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                    >
                      Tamamlandı
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activities and Quick Actions */}
        </div>
      </div>
    </div>
  );
}