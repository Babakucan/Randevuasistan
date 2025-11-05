'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { capitalizeName } from '@/lib/utils';
import { authApi, customersApi, getToken, removeToken } from '@/lib/api';
import { 
  Users, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  created_at: string;
  lastAppointment?: {
    date: string;
    daysAgo: number;
    isUpcoming: boolean;
  };
  totalAppointments: number;
  activeAppointmentsCount: number;
  hasActiveAppointments: boolean;
}

export default function CustomersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [customerStats, setCustomerStats] = useState({
    activeCustomers: 0,
    inactiveCustomers: 0
  });
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.profile-menu')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
        await loadCustomers();
      }
    } catch (error) {
      console.error('Error checking user:', error);
      removeToken();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const customersData = await customersApi.getAll();
      
      if (customersData && Array.isArray(customersData)) {
        // Her müşteri için randevu bilgilerini işle
        const customersWithAppointments = customersData.map((customer: any) => {
          // Müşterinin randevu bilgilerini işle
          const appointments = customer.appointments || [];
          const totalAppointments = appointments.length;
          
          // Aktif randevular (gelecekteki randevular)
          const now = new Date();
          const activeAppointments = appointments.filter((apt: any) => {
            const startTime = new Date(apt.startTime || apt.start_time);
            return startTime >= now && apt.status !== 'cancelled';
          });
          
          // Son randevu bilgisi (geçmiş ve gelecek randevuları dahil)
          let lastAppointment = undefined;
          if (appointments && appointments.length > 0) {
            const sortedAppointments = [...appointments].sort((a: any, b: any) => {
              const dateA = new Date(a.startTime || a.start_time).getTime();
              const dateB = new Date(b.startTime || b.start_time).getTime();
              return dateB - dateA; // En yeni randevu önce
            });
            
            const lastAppointmentData = sortedAppointments[0];
            const lastAppointmentDate = new Date(lastAppointmentData.startTime || lastAppointmentData.start_time);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const appointmentDateOnly = new Date(lastAppointmentDate);
            appointmentDateOnly.setHours(0, 0, 0, 0);
            const daysDiff = Math.floor((appointmentDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            lastAppointment = {
              date: lastAppointmentDate.toISOString(),
              daysAgo: daysDiff,
              isUpcoming: lastAppointmentDate >= now
            };
          }

          return {
            id: customer.id,
            name: customer.name,
            phone: customer.phone || '',
            email: customer.email || '',
            notes: customer.notes || '',
            created_at: customer.created_at || customer.createdAt,
            lastAppointment,
            totalAppointments,
            activeAppointmentsCount: activeAppointments.length,
            hasActiveAppointments: activeAppointments.length > 0
          };
        });

        setCustomers(customersWithAppointments);

        // Aktif/aktif olmayan müşteri istatistiklerini hesapla
        // Aktif müşteri: Gelecekteki randevusu olan veya son 1 yılda randevu alan müşteri
        const now = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const activeCustomers = customersWithAppointments.filter(customer => {
          // Gelecekteki aktif randevusu varsa kesinlikle aktif
          if (customer.hasActiveAppointments) {
            return true;
          }
          // Son 1 yılda randevu almışsa aktif
          if (customer.lastAppointment && new Date(customer.lastAppointment.date) > oneYearAgo) {
            return true;
          }
          return false;
        }).length;

        const inactiveCustomers = customersWithAppointments.length - activeCustomers;

        setCustomerStats({
          activeCustomers,
          inactiveCustomers
        });
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    // Önce arama filtresini uygula
    const matchesSearch = capitalizeName(customer.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Sonra aktiflik filtresini uygula
    if (activeFilter === 'all') return true;
    
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    // Aktif müşteri: Gelecekteki randevusu olan veya son 1 yılda randevu alan
    const isActive = customer.hasActiveAppointments || 
      (customer.lastAppointment && new Date(customer.lastAppointment.date) > oneYearAgo);

    if (activeFilter === 'active') return isActive;
    if (activeFilter === 'inactive') return !isActive;
    
    return true;
  });

  const handleDelete = async (customerId: string) => {
    if (!confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) return;

    try {
      await customersApi.delete(customerId);
      setCustomers(prev => prev.filter(cust => cust.id !== customerId));
      alert('Müşteri başarıyla silindi!');
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Müşteri silinirken hata oluştu.');
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
              <h1 className="text-2xl font-bold text-white">Müşteriler</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">
                {activeFilter === 'all' && `Toplam ${customers.length} müşteri`}
                {activeFilter === 'active' && `${customerStats.activeCustomers} aktif müşteri`}
                {activeFilter === 'inactive' && `${customerStats.inactiveCustomers} aktif olmayan müşteri`}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/customers/new')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Müşteri</span>
              </button>
              
              {/* Profile Menu */}
              <div className="relative profile-menu">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Users className="w-5 h-5 text-gray-300" />
                </button>
                
                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-700">
                        <div className="text-sm text-gray-300">{user?.email}</div>
                        <div className="text-xs text-gray-500">Yönetici</div>
                      </div>
                      <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        Dashboard
                      </button>
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
                        onClick={() => router.push('/services')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        Hizmetler
                      </button>
                      <div className="border-t border-gray-700 mt-2 pt-2">
                        <button
                          onClick={async () => {
                            removeToken();
                            router.push('/login');
                          }}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Müşteri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
            />
          </div>
          
          {/* Active Filter Indicator */}
          {activeFilter !== 'all' && (
            <button
              onClick={() => setActiveFilter('all')}
              className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors flex items-center space-x-2"
            >
              <span>Filtreyi Temizle</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Customer Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Aktif Müşteriler */}
          <button 
            onClick={() => setActiveFilter(activeFilter === 'active' ? 'all' : 'active')}
            className={`bg-gray-800/50 backdrop-blur-sm border rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer group ${
              activeFilter === 'active' 
                ? 'border-green-500 bg-green-900/20' 
                : 'border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Aktif Müşteriler</p>
                <p className="text-3xl font-bold text-green-400">{customerStats.activeCustomers}</p>
                <p className="text-sm text-gray-500">Son 1 yılda randevu alan</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${
                activeFilter === 'active' 
                  ? 'bg-green-600/40 scale-110' 
                  : 'bg-green-600/20 group-hover:scale-110'
              }`}>
                <Users className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </button>

          {/* Aktif Olmayan Müşteriler */}
          <button 
            onClick={() => setActiveFilter(activeFilter === 'inactive' ? 'all' : 'inactive')}
            className={`bg-gray-800/50 backdrop-blur-sm border rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer group ${
              activeFilter === 'inactive' 
                ? 'border-orange-500 bg-orange-900/20' 
                : 'border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Aktif Olmayan Müşteriler</p>
                <p className="text-3xl font-bold text-orange-400">{customerStats.inactiveCustomers}</p>
                <p className="text-sm text-gray-500">1 yıldan fazla randevu almayan</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${
                activeFilter === 'inactive' 
                  ? 'bg-orange-600/40 scale-110' 
                  : 'bg-orange-600/20 group-hover:scale-110'
              }`}>
                <Users className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </button>
        </div>

        {/* Customers Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    İletişim
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Randevu Bilgileri
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {capitalizeName(customer.name)}
                          </div>
                          {customer.notes && (
                            <div className="text-sm text-gray-400 truncate max-w-xs">
                              {customer.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-300">
                          <Phone className="w-4 h-4" />
                          <span>{customer.phone}</span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center space-x-2 text-sm text-gray-300">
                            <Mail className="w-4 h-4" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-300">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {customer.totalAppointments > 0 ? (
                              <>
                                <span className="font-medium text-white">{customer.totalAppointments} randevu</span>
                                {customer.activeAppointmentsCount > 0 && (
                                  <span className="ml-2 px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">
                                    {customer.activeAppointmentsCount} aktif
                                  </span>
                                )}
                                {customer.lastAppointment && (
                                  <span className="text-gray-400 ml-2">
                                    ({customer.lastAppointment.isUpcoming
                                      ? customer.lastAppointment.daysAgo > 0 
                                        ? `${customer.lastAppointment.daysAgo} gün sonra` 
                                        : customer.lastAppointment.daysAgo < 0 
                                          ? `${Math.abs(customer.lastAppointment.daysAgo)} gün önce`
                                          : 'bugün'
                                      : `${Math.abs(customer.lastAppointment.daysAgo)} gün önce`
                                    })
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400">Henüz randevu yok</span>
                            )}
                          </span>
                        </div>
                        {customer.lastAppointment && (
                          <div className="text-xs text-gray-500">
                            {customer.lastAppointment.isUpcoming ? 'Yaklaşan' : 'Son'} randevu: {new Date(customer.lastAppointment.date).toLocaleDateString('tr-TR')} {new Date(customer.lastAppointment.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(customer.created_at).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/customers/${customer.id}`)}
                          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-300" />
                        </button>
                        <button
                          onClick={() => router.push(`/customers/${customer.id}/edit`)}
                          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-300" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Müşteri Bulunamadı</h3>
            <p className="text-gray-400">Arama kriterlerinize uygun müşteri bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}
