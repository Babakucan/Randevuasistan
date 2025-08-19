'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { capitalizeName } from '@/lib/utils';
import { 
  Calendar, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  Clock,
  User,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  LogOut
} from 'lucide-react';

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string;
  created_at: string;
  customers: {
    name: string;
    phone: string;
  } | null;
  employees: {
    name: string;
  } | null;
  services: {
    name: string;
    price: number;
  } | null;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const itemsPerPage = 10;
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDateFilter, searchTerm]);

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      await loadAppointments(user.id);
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/login');
    }
  };

  const loadAppointments = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('salon_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profile) {
        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select(`
            id,
            start_time,
            end_time,
            status,
            notes,
            created_at,
            customers(name, phone),
            employees(name),
            services(name, price)
          `)
          .eq('salon_id', profile.id)
          .order('start_time', { ascending: false });

        if (appointmentsData) {
          setAppointments(appointmentsData as unknown as Appointment[]);
          setTotalPages(Math.ceil(appointmentsData.length / itemsPerPage));
        }
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    // Arama filtresi
    const searchMatch = 
      capitalizeName(appointment.customers?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      capitalizeName(appointment.employees?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      capitalizeName(appointment.services?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.customers?.phone?.includes(searchTerm);

    // Gün filtresi
    if (selectedDateFilter === 'all') {
      return searchMatch;
    }

    const appointmentDate = new Date(appointment.start_time);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    let dateMatch = false;
    switch (selectedDateFilter) {
      case 'today':
        dateMatch = appointmentDate.toDateString() === today.toDateString();
        break;
      case 'tomorrow':
        dateMatch = appointmentDate.toDateString() === tomorrow.toDateString();
        break;
      case 'this-week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        dateMatch = appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
        break;
      case 'next-week':
        const nextWeekStart = new Date(nextWeek);
        nextWeekStart.setDate(nextWeek.getDate() - nextWeek.getDay());
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
        dateMatch = appointmentDate >= nextWeekStart && appointmentDate <= nextWeekEnd;
        break;
      case 'past':
        dateMatch = appointmentDate < today;
        break;
      default:
        dateMatch = true;
    }

    return searchMatch && dateMatch;
  });

  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (appointmentId: string) => {
    if (!confirm('Bu randevuyu silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;

      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      alert('Randevu başarıyla silindi!');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Randevu silinirken hata oluştu.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-400';
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return 'Planlandı';
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
              <h1 className="text-2xl font-bold text-white">Randevular</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">Toplam {appointments.length} randevu</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/appointments/new')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Randevu</span>
              </button>
              
              {/* Profile Menu */}
              <div className="relative profile-menu">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5 text-gray-300" />
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
                      <div className="border-t border-gray-700 mt-2 pt-2">
                        <button
                          onClick={async () => {
                            await supabase.auth.signOut();
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
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Randevu ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {/* Date Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedDateFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                selectedDateFilter === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setSelectedDateFilter('today')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                selectedDateFilter === 'today'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
              }`}
            >
              Bugün
            </button>
            <button
              onClick={() => setSelectedDateFilter('tomorrow')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                selectedDateFilter === 'tomorrow'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
              }`}
            >
              Yarın
            </button>
            <button
              onClick={() => setSelectedDateFilter('this-week')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                selectedDateFilter === 'this-week'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
              }`}
            >
              Bu Hafta
            </button>
            <button
              onClick={() => setSelectedDateFilter('next-week')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                selectedDateFilter === 'next-week'
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
              }`}
            >
              Gelecek Hafta
            </button>
            <button
              onClick={() => setSelectedDateFilter('past')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                selectedDateFilter === 'past'
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
              }`}
            >
              Geçmiş
            </button>
          </div>
          
          {/* Filter Summary */}
          <div className="mt-3 text-sm text-gray-400">
            {selectedDateFilter !== 'all' && (
              <span>
                Filtrelenmiş: {filteredAppointments.length} randevu bulundu
                {filteredAppointments.length !== appointments.length && (
                  <span className="text-gray-500"> (toplam {appointments.length} randevudan)</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Müşteri & Hizmet
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Çalışan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Tarih & Saat
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {paginatedAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {capitalizeName(appointment.customers?.name || 'Bilinmeyen Müşteri')}
                          </div>
                          <div className="text-sm text-gray-400">
                            {capitalizeName(appointment.services?.name || 'Bilinmeyen Hizmet')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {appointment.customers?.phone || 'Telefon yok'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span className="ml-2 text-sm text-gray-300">
                          {capitalizeName(appointment.employees?.name || 'Bilinmeyen Çalışan')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {formatDateTime(appointment.start_time)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {appointment.services?.price || 0} ₺
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/appointments/${appointment.id}`)}
                          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-300" />
                        </button>
                        <button
                          onClick={() => router.push(`/appointments/${appointment.id}/edit`)}
                          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-300" />
                        </button>
                        <button
                          onClick={() => handleDelete(appointment.id)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Sayfa {currentPage} / {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
              >
                Önceki
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Randevu Bulunamadı</h3>
            <p className="text-gray-400">Arama kriterlerinize uygun randevu bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}
