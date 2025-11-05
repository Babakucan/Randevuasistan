'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { capitalizeName } from '@/lib/utils';
import { authApi, servicesApi, appointmentsApi, getToken, removeToken } from '@/lib/api';
import { 
  Settings, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  Clock,
  DollarSign,
  Tag,
  User,
  LogOut,
  BarChart3,
  Star,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  created_at: string;
}

interface ServiceStats {
  todayAppointments: number;
  todayEarnings: number;
}

export default function ServicesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceStats, setServiceStats] = useState<{ [key: string]: ServiceStats }>({});
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }
      const user = await authApi.getCurrentUser();
      if (user) {
        setUser(user);
        await loadServices();
      }
    } catch (error) {
      console.error('Error checking user:', error);
      removeToken();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const servicesData = await servicesApi.getAll();
      
      if (servicesData && Array.isArray(servicesData)) {
        const formattedServices = servicesData.map((service: any) => ({
          id: service.id,
          name: service.name,
          description: service.description || '',
          price: service.price || 0,
          duration: service.duration || 0,
          created_at: service.created_at || service.createdAt,
        }));
        setServices(formattedServices);
        await loadServiceStats(formattedServices);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadServiceStats = async (services: Service[]) => {
    try {
      // Tüm randevuları çek
      const allAppointments = await appointmentsApi.getAll();
      
      // Bugünün tarihini hesapla
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const stats: { [key: string]: ServiceStats } = {};

      // Her hizmet için bugünkü randevuları filtrele
      for (const service of services) {
        const todayAppointments = allAppointments.filter((apt: any) => {
          const appointmentDate = new Date(apt.startTime || apt.start_time);
          return appointmentDate >= today && 
                 appointmentDate < tomorrow && 
                 (apt.serviceId || apt.service_id) === service.id &&
                 apt.status !== 'cancelled';
        });

        const todayAppointmentsCount = todayAppointments.length;
        const todayEarnings = todayAppointments.reduce((sum: number, apt: any) => {
          const price = apt.service?.price || service.price || 0;
          return sum + price;
        }, 0);

        stats[service.id] = {
          todayAppointments: todayAppointmentsCount,
          todayEarnings
        };
      }

      setServiceStats(stats);
    } catch (error) {
      console.error('Error loading service stats:', error);
      // Hata durumunda boş stats set et
      const emptyStats: { [key: string]: ServiceStats } = {};
      services.forEach(service => {
        emptyStats[service.id] = { todayAppointments: 0, todayEarnings: 0 };
      });
      setServiceStats(emptyStats);
    }
  };

  const loadPerformanceData = async (serviceId: string, date: string) => {
    try {
      const startDate = new Date(date);
      startDate.setDate(startDate.getDate() - 7); // Son 7 gün
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      // Tüm randevuları çek
      const allAppointments = await appointmentsApi.getAll();
      
      // Son 7 günün randevularını filtrele
      const appointments = allAppointments.filter((apt: any) => {
        const appointmentDate = new Date(apt.startTime || apt.start_time);
        return appointmentDate >= startDate && 
               appointmentDate <= endDate && 
               (apt.serviceId || apt.service_id) === serviceId &&
               apt.status !== 'cancelled';
      }).sort((a: any, b: any) => {
        const dateA = new Date(a.startTime || a.start_time).getTime();
        const dateB = new Date(b.startTime || b.start_time).getTime();
        return dateB - dateA; // En yeni önce
      });

      if (appointments) {
        // Günlük performans verilerini grupla
        const dailyStats: { [key: string]: any } = {};
        
        appointments.forEach(apt => {
          const appointmentDate = apt.startTime || apt.start_time;
          const day = new Date(appointmentDate).toISOString().split('T')[0];
          if (!dailyStats[day]) {
            dailyStats[day] = {
              date: day,
              appointments: [],
              totalAppointments: 0,
              totalEarnings: 0
            };
          }
          
          dailyStats[day].appointments.push(apt);
          dailyStats[day].totalAppointments += 1;
          const price = apt.service?.price || 0;
          dailyStats[day].totalEarnings += price;
        });

        // Son 7 günü doldur (boş günler için)
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayStr = date.toISOString().split('T')[0];
          
          last7Days.push({
            date: dayStr,
            appointments: dailyStats[dayStr]?.appointments || [],
            totalAppointments: dailyStats[dayStr]?.totalAppointments || 0,
            totalEarnings: dailyStats[dayStr]?.totalEarnings || 0
          });
        }

        setPerformanceData(last7Days);
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
      setPerformanceData([]);
    }
  };

  const filteredServices = services.filter(service =>
    capitalizeName(service.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.price.toString().includes(searchTerm)
  );

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) return;

    try {
      await servicesApi.delete(serviceId);

      setServices(prev => prev.filter(service => service.id !== serviceId));
      alert('Hizmet başarıyla silindi!');
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Hizmet silinirken hata oluştu.');
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Dashboard</span>
              </button>
              <span className="text-gray-400">|</span>
              <h1 className="text-2xl font-bold text-white">Hizmetler</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">Toplam {services.length} hizmet</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/services/new')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Hizmet</span>
              </button>
              
              {/* Profile Menu */}
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <User className="w-5 h-5 text-gray-300" />
                  <span className="text-gray-300 text-sm">{user?.email}</span>
                </button>
              </div>

              {/* Sign Out */}
              <button
                onClick={async () => {
                  removeToken();
                  router.push('/login');
                }}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Hizmet ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {/* Performance Section */}
        <div className="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Hizmet Performansı</span>
              </h2>
              <p className="text-gray-400 text-sm mt-1">Bugünkü hizmet performans istatistikleri</p>
            </div>
            <button
              onClick={() => setShowPerformanceModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Detaylı Performans</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* En Çok Randevu */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">En Çok Randevu</p>
                  <p className="text-2xl font-bold text-white">
                    {(() => {
                      const mostBooked = services.reduce((most, service) => {
                        const serviceStats_ = serviceStats[service.id];
                        const mostStats = serviceStats[most?.id];
                        return (serviceStats_?.todayAppointments || 0) > (mostStats?.todayAppointments || 0) ? service : most;
                      }, null as any);
                      return mostBooked ? capitalizeName(mostBooked.name || '').split(' ')[0] : 'Yok';
                    })()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(() => {
                      const mostBooked = services.reduce((most, service) => {
                        const serviceStats_ = serviceStats[service.id];
                        const mostStats = serviceStats[most?.id];
                        return (serviceStats_?.todayAppointments || 0) > (mostStats?.todayAppointments || 0) ? service : most;
                      }, null as any);
                      const stats = mostBooked ? serviceStats[mostBooked.id] : null;
                      return stats ? `${stats.todayAppointments} randevu bugün` : '';
                    })()}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-orange-400" />
                </div>
              </div>
            </div>

            {/* En Yüksek Kazanç */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">En Yüksek Kazanç</p>
                  <p className="text-2xl font-bold text-white">
                    {(() => {
                      const highestEarning = services.reduce((highest, service) => {
                        const serviceStats_ = serviceStats[service.id];
                        const highestStats = serviceStats[highest?.id];
                        return (serviceStats_?.todayEarnings || 0) > (highestStats?.todayEarnings || 0) ? service : highest;
                      }, null as any);
                      return highestEarning ? capitalizeName(highestEarning.name || '').split(' ')[0] : 'Yok';
                    })()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(() => {
                      const highestEarning = services.reduce((highest, service) => {
                        const serviceStats_ = serviceStats[service.id];
                        const highestStats = serviceStats[highest?.id];
                        return (serviceStats_?.todayEarnings || 0) > (highestStats?.todayEarnings || 0) ? service : highest;
                      }, null as any);
                      const stats = highestEarning ? serviceStats[highestEarning.id] : null;
                      return stats ? `${stats.todayEarnings} ₺ bugün` : '';
                    })()}
                  </p>
                </div>
                <div className="w-10 h-10 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Ortalama Performans */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Ortalama Performans</p>
                  <p className="text-2xl font-bold text-white">
                    {(() => {
                      const totalAppointments = Object.values(serviceStats).reduce((sum, stat) => sum + stat.todayAppointments, 0);
                      return services.length > 0 ? Math.round(totalAppointments / services.length) : 0;
                    })()} randevu
                  </p>
                  <p className="text-sm text-gray-500">Hizmet başına bugün</p>
                </div>
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Toplam Performans */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Toplam Performans</p>
                  <p className="text-2xl font-bold text-white">
                    {Object.values(serviceStats).reduce((sum, stat) => sum + stat.todayEarnings, 0)} ₺
                  </p>
                  <p className="text-sm text-gray-500">Bugünkü toplam kazanç</p>
                </div>
                <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* En Çok Randevu Alan Hizmet */}
          {(() => {
            const mostBookedService = services.reduce((most, service) => {
              const serviceStats_ = serviceStats[service.id];
              const mostStats = serviceStats[most?.id];
              return (serviceStats_?.todayAppointments || 0) > (mostStats?.todayAppointments || 0) ? service : most;
            }, null as any);

            if (mostBookedService) {
              const stats = serviceStats[mostBookedService.id];
              return (
                <div className="mt-6 p-4 bg-gradient-to-r from-orange-600/20 to-orange-500/20 border border-orange-600/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-300">🏆 En Çok Randevu Alan Hizmet</p>
                      <p className="text-lg font-semibold text-white">{capitalizeName(mostBookedService.name || '')}</p>
                      <p className="text-sm text-orange-300">
                        {stats?.todayAppointments || 0} randevu • {stats?.todayEarnings || 0} ₺ bugün
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
                      <Star className="w-6 h-6 text-orange-400" />
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div key={service.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push(`/services/${service.id}`)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4 text-gray-300" />
                  </button>
                  <button
                    onClick={() => router.push(`/services/${service.id}/edit`)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-300" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {capitalizeName(service.name)}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {service.description || 'Açıklama yok'}
                </p>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-lg font-bold text-white">
                    {service.price} ₺
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">
                    {service.duration} dk
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">Bugünkü Randevu</span>
                  </div>
                  <p className="text-white font-semibold text-lg">
                    {serviceStats[service.id]?.todayAppointments || 0}
                  </p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">Bugünkü Kazanç</span>
                  </div>
                  <p className="text-white font-semibold text-lg">
                    {serviceStats[service.id]?.todayEarnings || 0} ₺
                  </p>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Eklenme: {formatDateTime(service.created_at)}
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Hizmet Bulunamadı</h3>
            <p className="text-gray-400">Arama kriterlerinize uygun hizmet bulunamadı.</p>
          </div>
        )}
      </div>

      {/* Detailed Performance Modal */}
      {showPerformanceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Detaylı Performans Analizi</h2>
              <button
                onClick={() => setShowPerformanceModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Service Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Hizmet Seçin</label>
                <select 
                  onChange={(e) => {
                    const service = services.find(s => s.id === e.target.value);
                    if (service) {
                      setSelectedService(service);
                      loadPerformanceData(service.id, selectedDate);
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Hizmet seçin...</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {capitalizeName(service.name || '')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tarih Seçin</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    if (selectedService) {
                      loadPerformanceData(selectedService.id, e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Performance Table */}
              {selectedService && performanceData.length > 0 && (
                <>
                  <div className="bg-gray-700/50 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-600/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Tarih
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Randevu Sayısı
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Toplam Kazanç
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Detaylar
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-600">
                          {performanceData.map((day) => (
                            <tr key={day.date} className="hover:bg-gray-600/30">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-white">
                                  {new Date(day.date).toLocaleDateString('tr-TR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-white font-semibold">
                                  {day.totalAppointments}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-white font-semibold">
                                  {day.totalEarnings} ₺
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-gray-300">
                                  {day.appointments.length > 0 ? (
                                    <div className="space-y-1">
                                      {day.appointments.slice(0, 3).map((apt: any, index: number) => (
                                        <div key={index} className="flex items-center space-x-2">
                                          <span className="text-xs text-gray-400">
                                            {new Date(apt.startTime || apt.start_time).toLocaleTimeString('tr-TR', {
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                          <span className="text-xs">
                                            {(apt.customer?.name || apt.customerName || 'Bilinmeyen')} - {capitalizeName(selectedService.name)}
                                          </span>
                                          <span className="text-xs text-green-400">
                                            {(apt.service?.price || selectedService.price || 0)} ₺
                                          </span>
                                        </div>
                                      ))}
                                      {day.appointments.length > 3 && (
                                        <div className="text-xs text-gray-400">
                                          +{day.appointments.length - 3} randevu daha...
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-500">Randevu yok</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="text-sm text-gray-400">Toplam Randevu</div>
                      <div className="text-2xl font-bold text-white">
                        {performanceData.reduce((sum, day) => sum + day.totalAppointments, 0)}
                      </div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="text-sm text-gray-400">Toplam Kazanç</div>
                      <div className="text-2xl font-bold text-white">
                        {performanceData.reduce((sum, day) => sum + day.totalEarnings, 0)} ₺
                      </div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="text-sm text-gray-400">Ortalama Günlük</div>
                      <div className="text-2xl font-bold text-white">
                        {performanceData.length > 0 ? Math.round(performanceData.reduce((sum, day) => sum + day.totalEarnings, 0) / performanceData.length) : 0} ₺
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!selectedService && (
                <div className="text-center py-8 text-gray-400">
                  Lütfen bir hizmet seçin
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
