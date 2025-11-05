'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { capitalizeName } from '@/lib/utils';
import { authApi, employeesApi, appointmentsApi, getToken, removeToken } from '@/lib/api';
import { 
  Users, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Clock,
  BarChart3,
  Star,
  User,
  TrendingUp
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  specialties: string;
  hourly_rate: number;
  bio: string;
  experience_years: number;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
}

interface EmployeeStats {
  todayAppointments: number;
  todayEarnings: number;
}

export default function EmployeesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [employeeStats, setEmployeeStats] = useState<{ [key: string]: EmployeeStats }>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [performanceData, setPerformanceData] = useState<any[]>([]);

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
        await loadEmployees();
      }
    } catch (error) {
      console.error('Error checking user:', error);
      removeToken();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const employeesData = await employeesApi.getAll();
      
      if (employeesData && Array.isArray(employeesData)) {
        const formattedEmployees = employeesData.map((emp: any) => ({
          id: emp.id,
          name: emp.name,
          email: emp.email || '',
          phone: emp.phone || '',
          position: emp.position || '',
          specialties: emp.specialties || '',
          hourly_rate: emp.hourlyRate || emp.hourly_rate || 0,
          bio: emp.bio || '',
          experience_years: emp.experienceYears || emp.experience_years || 0,
          is_active: emp.isActive !== undefined ? emp.isActive : emp.is_active !== false,
          avatar_url: emp.avatarUrl || emp.avatar_url,
          created_at: emp.created_at || emp.createdAt,
        }));
        
        setEmployees(formattedEmployees);
        await loadEmployeeStats(formattedEmployees);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeStats = async (employees: Employee[]) => {
    try {
      // Tüm randevuları çek
      const allAppointments = await appointmentsApi.getAll();
      
      // Bugünün tarihini hesapla
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const stats: { [key: string]: EmployeeStats } = {};

      // Her çalışan için bugünkü randevuları filtrele
      for (const employee of employees) {
        const todayAppointments = allAppointments.filter((apt: any) => {
          const appointmentDate = new Date(apt.startTime || apt.start_time);
          return appointmentDate >= today && 
                 appointmentDate < tomorrow && 
                 (apt.employeeId || apt.employee_id) === employee.id &&
                 apt.status !== 'cancelled';
        });

        const todayAppointmentsCount = todayAppointments.length;
        const todayEarnings = todayAppointments.reduce((sum: number, apt: any) => {
          const price = apt.service?.price || apt.services?.price || 0;
          return sum + price;
        }, 0);

        stats[employee.id] = {
          todayAppointments: todayAppointmentsCount,
          todayEarnings
        };
      }

      setEmployeeStats(stats);
    } catch (error) {
      console.error('Error loading employee stats:', error);
      // Hata durumunda boş stats set et
      const emptyStats: { [key: string]: EmployeeStats } = {};
      employees.forEach(emp => {
        emptyStats[emp.id] = { todayAppointments: 0, todayEarnings: 0 };
      });
      setEmployeeStats(emptyStats);
    }
  };

  const loadPerformanceData = async (employeeId: string, salonId: string, date: string) => {
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
               (apt.employeeId || apt.employee_id) === employeeId &&
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
          const price = apt.service?.price || apt.services?.price || 0;
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

  const filteredEmployees = employees.filter(employee =>
    capitalizeName(employee.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    capitalizeName(employee.position || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (employeeId: string) => {
    if (!confirm('Bu çalışanı silmek istediğinizden emin misiniz?')) return;

    try {
      await employeesApi.delete(employeeId);

      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      alert('Çalışan başarıyla silindi!');
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Çalışan silinirken hata oluştu.');
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
              <h1 className="text-2xl font-bold text-white">Çalışanlar</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">Toplam {employees.length} çalışan</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/employees/new')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Çalışan</span>
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
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Çalışan ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {/* Employee Performance Reports */}
        <div className="mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Çalışan Performans Analizi
              </h2>
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => setShowPerformanceModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300"
                >
                  Detaylı Performans
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* En Aktif Çalışan */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">En Aktif Çalışan</p>
                    <p className="text-2xl font-bold text-white">
                      {(() => {
                        const mostActive = employees.reduce((most, emp) => {
                          const empStats = employeeStats[emp.id];
                          const mostStats = employeeStats[most?.id];
                          return (empStats?.todayAppointments || 0) > (mostStats?.todayAppointments || 0) ? emp : most;
                        }, null as any);
                        return mostActive ? capitalizeName(mostActive.name || '').split(' ')[0] : 'Yok';
                      })()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(() => {
                        const mostActive = employees.reduce((most, emp) => {
                          const empStats = employeeStats[emp.id];
                          const mostStats = employeeStats[most?.id];
                          return (empStats?.todayAppointments || 0) > (mostStats?.todayAppointments || 0) ? emp : most;
                        }, null as any);
                        const stats = mostActive ? employeeStats[mostActive.id] : null;
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
                        const highestEarner = employees.reduce((highest, emp) => {
                          const empStats = employeeStats[emp.id];
                          const highestStats = employeeStats[highest?.id];
                          return (empStats?.todayEarnings || 0) > (highestStats?.todayEarnings || 0) ? emp : highest;
                        }, null as any);
                        return highestEarner ? capitalizeName(highestEarner.name || '').split(' ')[0] : 'Yok';
                      })()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(() => {
                        const highestEarner = employees.reduce((highest, emp) => {
                          const empStats = employeeStats[emp.id];
                          const highestStats = employeeStats[highest?.id];
                          return (empStats?.todayEarnings || 0) > (highestStats?.todayEarnings || 0) ? emp : highest;
                        }, null as any);
                        const stats = highestEarner ? employeeStats[highestEarner.id] : null;
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
                        const totalAppointments = Object.values(employeeStats).reduce((sum, stat) => sum + stat.todayAppointments, 0);
                        const activeEmployees = employees.filter(emp => emp.is_active).length;
                        return activeEmployees > 0 ? Math.round(totalAppointments / activeEmployees) : 0;
                      })()} randevu
                    </p>
                    <p className="text-sm text-gray-500">Çalışan başına bugün</p>
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
                      {Object.values(employeeStats).reduce((sum, stat) => sum + stat.todayEarnings, 0)} ₺
                    </p>
                    <p className="text-sm text-gray-500">Bugünkü toplam kazanç</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* En Aktif Çalışan */}
            {(() => {
              const mostActiveEmployee = employees.reduce((most, emp) => {
                const empStats = employeeStats[emp.id];
                const mostStats = employeeStats[most?.id];
                return (empStats?.todayAppointments || 0) > (mostStats?.todayAppointments || 0) ? emp : most;
              }, null as any);

              if (mostActiveEmployee) {
                const stats = employeeStats[mostActiveEmployee.id];
                return (
                  <div className="mt-6 p-4 bg-gradient-to-r from-orange-600/20 to-orange-500/20 border border-orange-600/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-300">🏆 En Aktif Çalışan</p>
                        <p className="text-lg font-semibold text-white">{capitalizeName(mostActiveEmployee.name || '')}</p>
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
        </div>

        {/* Employees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300">
              {/* Employee Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{capitalizeName(employee.name || '')}</h3>
                    <p className="text-gray-400 text-sm">{capitalizeName(employee.position || '')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setShowModal(true);
                    }}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4 text-gray-300" />
                  </button>
                  <button
                    onClick={() => router.push(`/employees/${employee.id}/edit`)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-300" />
                  </button>
                  <button
                    onClick={() => handleDelete(employee.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-gray-300 text-sm">
                  <Mail className="w-4 h-4" />
                  <span>{employee.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>{employee.phone}</span>
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
                    {employeeStats[employee.id]?.todayAppointments || 0}
                  </p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">Bugünkü Kazanç</span>
                  </div>
                  <p className="text-white font-semibold text-lg">
                    {employeeStats[employee.id]?.todayEarnings || 0} ₺
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-2">
                {employee.specialties && (
                  <div className="flex items-center space-x-2 text-gray-300 text-sm">
                    <Clock className="w-4 h-4" />
                    <span className="text-gray-400">Uzmanlık: {capitalizeName(employee.specialties || '')}</span>
                  </div>
                )}
                {employee.hourly_rate && (
                  <div className="flex items-center space-x-2 text-gray-300 text-sm">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-gray-400">Saatlik Ücret: {employee.hourly_rate} ₺</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Çalışan Bulunamadı</h3>
            <p className="text-gray-400">Arama kriterlerinize uygun çalışan bulunamadı.</p>
          </div>
        )}
      </div>

      {/* Employee Detail Modal */}
      {showModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Çalışan Detayları</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{capitalizeName(selectedEmployee.name || '')}</h3>
                <p className="text-gray-400">{capitalizeName(selectedEmployee.position || '')}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{selectedEmployee.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{selectedEmployee.phone}</span>
                </div>
              </div>
              
              {selectedEmployee.bio && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">Biyografi</h4>
                  <p className="text-gray-400 text-sm">{selectedEmployee.bio}</p>
                </div>
              )}
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setShowModal(false);
                    router.push(`/employees/${selectedEmployee.id}/edit`);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Çalışan Seçin</label>
                <select 
                  onChange={(e) => {
                    const employee = employees.find(emp => emp.id === e.target.value);
                    if (employee) {
                      loadPerformanceData(employee.id, employee.salon_id, selectedDate);
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Çalışan seçin...</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {capitalizeName(employee.name || '')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Performance Table */}
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
                                        {(apt.customers as any)?.name || 'Bilinmeyen'} - {(apt.services as any)?.name || 'Bilinmeyen'}
                                      </span>
                                      <span className="text-xs text-green-400">
                                        {(apt.services as any)?.price || 0} ₺
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
