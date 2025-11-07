'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { capitalizeName } from '@/lib/utils';
import { authApi, dashboardApi, customersApi, servicesApi, employeesApi, appointmentsApi, removeToken, getToken, getCurrentSalonId, setCurrentSalonId } from '@/lib/api';
import AdminShell from '@/components/layout/AdminShell';
import {
  Calendar,
  Users,
  DollarSign,
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
  Building
} from 'lucide-react';

interface RecentActivity {
  id: string;
  type: 'appointment' | 'customer' | 'employee' | 'service';
  description: string;
  details: string;
  timestamp: string;
  created_at: string;
}

interface ChartData {
  labels: string[];
  data: number[];
  colors: string[];
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
  const [loading, setLoading] = useState(true);
  const [showQuickAppointment, setShowQuickAppointment] = useState(false);
  const [showQuickCustomer, setShowQuickCustomer] = useState(false);
  const [showQuickEmployee, setShowQuickEmployee] = useState(false);
  const [showQuickService, setShowQuickService] = useState(false);
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [todayUpcomingAppointments, setTodayUpcomingAppointments] = useState<any[]>([]);
  const [todayCompletedAppointments, setTodayCompletedAppointments] = useState<any[]>([]);
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState<string | null>(null);
  const [currentSalonId, setCurrentSalonIdState] = useState<string | null>(null);

  const appointmentStatusOptions = [
    { value: 'scheduled', label: 'Beklemede' },
    { value: 'confirmed', label: 'Başladı' },
    { value: 'completed', label: 'Tamamlandı' },
    { value: 'cancelled', label: 'İptal' },
    { value: 'no-show', label: 'Gelmedi' },
  ] as const;

  const loadTodayAppointments = async () => {
    try {
      const appointmentsData = await appointmentsApi.getAll();
      if (!appointmentsData || !Array.isArray(appointmentsData)) {
        setTodayUpcomingAppointments([]);
        setTodayCompletedAppointments([]);
        return;
      }

      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const normalizedAppointments = appointmentsData
        .map((appointment: any) => {
          const start = new Date(appointment.startTime || appointment.start_time);
          if (Number.isNaN(start.getTime())) {
            return null;
          }

          const end = new Date(appointment.endTime || appointment.end_time || start);

          return {
            ...appointment,
            start,
            end,
            status: appointment.status || 'scheduled',
          };
        })
        .filter(Boolean)
        .filter((appointment: any) => appointment.start >= startOfDay && appointment.start <= endOfDay);

      const upcoming = normalizedAppointments
        .filter((appointment: any) => !['completed', 'cancelled', 'no-show'].includes(appointment.status))
        .sort((a: any, b: any) => a.start.getTime() - b.start.getTime());

      const completed = normalizedAppointments
        .filter((appointment: any) => appointment.status === 'completed')
        .sort((a: any, b: any) => b.start.getTime() - a.start.getTime());

      setTodayUpcomingAppointments(upcoming);
      setTodayCompletedAppointments(completed);
    } catch (error) {
      console.error('Error loading today appointments:', error);
      setTodayUpcomingAppointments([]);
      setTodayCompletedAppointments([]);
    }
  };

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

  const handleAppointmentStatusChange = async (appointmentId: string, status: string) => {
    if (!status) return;

    try {
      setUpdatingAppointmentId(appointmentId);
      await appointmentsApi.update(appointmentId, { status });
      await loadTodayAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Randevu durumu güncellenirken hata oluştu');
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  const formatAppointmentTimeRange = (start: Date, end: Date) => {
    const startText = start.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const endText = end.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    return `${startText} - ${endText}`;
  };

  const formatAppointmentDate = (start: Date) => {
    return start.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border border-red-500/40';
      case 'no-show':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/40';
    }
  };

  const getStatusLabel = (status: string) => {
    const option = appointmentStatusOptions.find((item) => item.value === status);
    return option ? option.label : status;
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

  const loadChartData = async (salonId: string) => {
    try {
      // TODO: Implement chart data loading with new backend
      setWeeklyData({ labels: [], data: [], colors: [] });
      setServiceData({ labels: [], data: [], colors: [] });
    } catch (error) {
      console.error('Error loading chart data:', error);
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

  const loadSalonScopedData = async (salonId: string) => {
    await Promise.all([
      loadStats(salonId),
      loadRecentActivities(salonId),
      loadQuickAppointmentData(salonId),
      loadTodayAppointments(),
    ]);
  };

  const checkUser = async () => {
    try {
      const token = getToken();
      if (!token) {
        router.push('/login');
        setLoading(false);
        return;
      }

      const currentUser = await authApi.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);

        if (currentUser.salonProfiles && currentUser.salonProfiles.length > 0) {
          let salonId = getCurrentSalonId();

          if (!salonId || !currentUser.salonProfiles.some((sp) => sp.id === salonId)) {
            salonId = currentUser.salonProfiles[0].id;
          }

          setCurrentSalonId(salonId);
          setCurrentSalonIdState(salonId);

          try {
            await loadSalonScopedData(salonId);
          } catch (error) {
            console.error('Error loading dashboard data:', error);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

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

  const handleSalonChange = async (salonId: string) => {
    if (!salonId || salonId === currentSalonId) {
      return;
    }

    if (!user?.salonProfiles?.some((sp) => sp.id === salonId)) {
      return;
    }

    try {
      setLoading(true);
      setCurrentSalonIdState(salonId);
      setCurrentSalonId(salonId);
      await loadSalonScopedData(salonId);
    } catch (error) {
      console.error('Error switching salon:', error);
    } finally {
      setLoading(false);
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
  const salonOptions = (user?.salonProfiles ?? []).map((salon: any) => ({
    id: salon.id,
    name: salon.name,
  }));

  const activeSalonName =
    salonOptions.find((salon) => salon.id === currentSalonId)?.name ||
    salonOptions[0]?.name ||
    'Salon';

  if (loading) {
    return (
      <>
        <AdminShell
          title="Dashboard"
          user={user}
          salons={salonOptions}
          currentSalonId={currentSalonId}
          onSalonChange={handleSalonChange}
          onSignOut={handleSignOut}
        >
          <div className="flex h-60 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-3 text-slate-300">
              <span className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-slate-200" />
              <span>Yükleniyor...</span>
            </div>
          </div>
        </AdminShell>
      </>
    )
  }
  return (
    <>
      <AdminShell
        title="Dashboard"
        user={user}
        salons={salonOptions}
        currentSalonId={currentSalonId}
        onSalonChange={handleSalonChange}
        onSignOut={handleSignOut}
      >
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <button
            onClick={() => router.push('/appointments')}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-left transition hover:border-blue-500/40 hover:bg-slate-900/80"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Toplam Randevu</p>
                <p className="text-2xl font-semibold text-white">{stats.totalAppointments}</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => router.push('/customers')}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-left transition hover:border-emerald-500/40 hover:bg-slate-900/80"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Toplam Müşteri</p>
                <p className="text-2xl font-semibold text-white">{stats.totalCustomers}</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => router.push('/employees')}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-left transition hover:border-orange-500/40 hover:bg-slate-900/80"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Çalışan</p>
                <p className="text-2xl font-semibold text-white">{stats.totalEmployees}</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => router.push('/services')}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-left transition hover:border-purple-500/40 hover:bg-slate-900/80"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Hizmet</p>
                <p className="text-2xl font-semibold text-white">{stats.totalServices}</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => setShowEarningsModal(true)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-left transition hover:border-emerald-500/40 hover:bg-slate-900/80"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Bugünkü Kazanç</p>
                <p className="text-2xl font-semibold text-white">{stats.todayEarnings} ₺</p>
              </div>
            </div>
          </button>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Bugünkü Randevular</h2>
                <p className="text-sm text-slate-400">Durumu güncelleyin, müşterilerinizden haberdar olun</p>
              </div>
              <span className="inline-flex items-center rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                {todayUpcomingAppointments.length} aktif randevu
              </span>
            </div>
            <div className="mt-5 space-y-4">
              {todayUpcomingAppointments.length > 0 ? (
                todayUpcomingAppointments.map((appointment: any) => (
                  <div
                    key={appointment.id}
                    className="rounded-lg border border-slate-800 bg-slate-900/70 p-4 transition hover:border-blue-500/40"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-white">
                            {appointment.customer?.name ? capitalizeName(appointment.customer.name) : 'Müşteri bilgisi yok'}
                          </p>
                          <span className={`rounded-full px-2 py-1 text-xs ${getStatusBadgeClasses(appointment.status)}`}>
                            {getStatusLabel(appointment.status)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">{appointment.service?.name || 'Hizmet bilgisi yok'}</p>
                        <p className="text-xs text-slate-400">
                          {appointment.employee?.name ? `${appointment.employee.name} • ` : ''}
                          {formatAppointmentDate(appointment.start)} • {formatAppointmentTimeRange(appointment.start, appointment.end)}
                        </p>
                        {appointment.notes && (
                          <p className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-400">
                            {appointment.notes}
                          </p>
                        )}
                      </div>
                      <div className="w-full space-y-2 md:w-48">
                        <label className="text-xs text-slate-400">Durumu Güncelle</label>
                        <select
                          value={appointment.status}
                          onChange={(event) => handleAppointmentStatusChange(appointment.id, event.target.value)}
                          disabled={updatingAppointmentId === appointment.id}
                          className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {appointmentStatusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {updatingAppointmentId === appointment.id && (
                          <p className="text-xs text-blue-300">Güncelleniyor...</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-900/70 text-slate-400">
                  <Calendar className="mb-2 h-8 w-8" />
                  Bugün için planlanmış aktif randevu yok
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold text-white">Bugün Tamamlananlar</h2>
            <div className="mt-4 space-y-3">
              {todayCompletedAppointments.length > 0 ? (
                todayCompletedAppointments.slice(0, 5).map((appointment: any) => (
                  <div key={appointment.id} className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {appointment.customer?.name ? capitalizeName(appointment.customer.name) : 'Müşteri'}
                        </p>
                        <p className="text-xs text-slate-300">{appointment.service?.name || 'Hizmet'}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {formatAppointmentTimeRange(appointment.start, appointment.end)}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-300">Tamamlandı</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-900/70 text-slate-400">
                  Henüz tamamlanan randevu yok
                </div>
              )}
            </div>
            {todayCompletedAppointments.length > 5 && (
              <p className="mt-3 text-xs text-slate-400">
                Toplam {todayCompletedAppointments.length} randevu tamamlandı.
              </p>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Son Aktiviteler</h2>
              <span className="text-xs text-slate-400">En yeni gelişmeler</span>
            </div>
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => handleActivityClick(activity)}
                    className="flex w-full items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-3 text-left transition hover:border-blue-500/40"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-500/20 text-blue-300">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{activity.description}</p>
                      <p className="mt-1 text-xs text-slate-400">{activity.details}</p>
                      <p className="mt-1 text-xs text-slate-500">{activity.timestamp}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </button>
                ))
              ) : (
                <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-900/70 text-slate-400">
                  Henüz aktivite yok
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold text-white">Hızlı İşlemler</h2>
            <div className="mt-4 space-y-3">
              <button
                onClick={() => setShowQuickAppointment(true)}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-left transition hover:border-blue-500/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500/20 text-blue-300">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-white">Yeni Randevu</span>
              </button>
              <button
                onClick={() => setShowQuickCustomer(true)}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-left transition hover:border-emerald-500/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-300">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-white">Yeni Müşteri</span>
              </button>
              <button
                onClick={() => setShowQuickEmployee(true)}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-left transition hover:border-orange-500/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-500/20 text-orange-300">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-white">Yeni Çalışan</span>
              </button>
              <button
                onClick={() => setShowQuickService(true)}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-left transition hover:border-purple-500/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-500/20 text-purple-300">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-white">Yeni Hizmet</span>
              </button>
              <button
                onClick={() => router.push('/phone-calls')}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-left transition hover:border-red-500/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-500/20 text-red-300">
                  <Phone className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-white">Telefon Aramaları</span>
              </button>
              <button
                onClick={() => router.push('/whatsapp')}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-left transition hover:border-green-500/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-500/20 text-green-300">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-white">WhatsApp Mesajları</span>
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Haftalık Randevular</h2>
              <span className="text-xs text-slate-400">Son 7 gün</span>
            </div>
            <div className="space-y-3">
              {weeklyData.labels.map((label, index) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-16 text-sm text-slate-300">{label}</span>
                  <div className="h-5 flex-1 rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width:
                          weeklyData.data[index] > 0
                            ? `${(weeklyData.data[index] / Math.max(...weeklyData.data, 1)) * 100}%`
                            : '0%',
                        backgroundColor: weeklyData.colors[index] || '#3b82f6',
                      }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm text-slate-300">{weeklyData.data[index]}</span>
                </div>
              ))}
              {weeklyData.labels.length === 0 && (
                <p className="text-sm text-slate-400">Grafik verisi bulunmuyor.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Hizmet Dağılımı</h2>
              <span className="text-xs text-slate-400">Toplam {serviceData.data.reduce((a, b) => a + b, 0)}</span>
            </div>
            <div className="space-y-3">
              {serviceData.labels.map((label, index) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: serviceData.colors[index] || '#6366f1' }}
                    />
                    <span className="text-sm text-slate-200">{label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <span>{serviceData.data[index]}</span>
                    <span className="text-xs text-slate-500">
                      (
                      {(
                        (serviceData.data[index] /
                          Math.max(serviceData.data.reduce((a, b) => a + b, 0), 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </div>
                </div>
              ))}
              {serviceData.labels.length === 0 && (
                <p className="text-sm text-slate-400">Hizmet verisi bulunmuyor.</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-white">Sistem Durumu</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
            {[
              { label: 'Veritabanı', status: 'Aktif' },
              { label: 'Kimlik Doğrulama', status: 'Aktif' },
              { label: 'API', status: 'Aktif' },
              { label: 'Bildirimler', status: 'Aktif' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-3">
                <div className="flex items-center gap-2 text-slate-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {item.label}
                </div>
                <span className="text-xs font-medium text-emerald-300">{item.status}</span>
              </div>
            ))}
          </div>
        </section>
      </AdminShell>

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
    </>
  )
}