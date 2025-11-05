'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Settings, Users, Calendar, ArrowLeft, Edit, Trash2, Clock, DollarSign, LogOut, User, Tag } from 'lucide-react'
import { authApi, servicesApi, employeesApi, appointmentsApi, getToken, removeToken } from '@/lib/api'
import { capitalizeName } from '@/lib/utils'

export default function ServiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const serviceId = params.id as string
  
  const [user, setUser] = useState<any>(null)
  const [service, setService] = useState<any>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  useEffect(() => {
    checkUser()
  }, [serviceId])

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
        setLoading(false);
        return;
      }

      const user = await authApi.getCurrentUser();
      if (user) {
        setUser(user);
        await loadServiceData();
      } else {
        router.push('/login');
        setLoading(false);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      removeToken();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  const loadServiceData = async () => {
    try {
      setLoading(true);
      
      // Hizmet bilgilerini yükle
      const serviceData = await servicesApi.getById(serviceId);
      if (!serviceData) {
        setLoading(false);
        return;
      }
      setService(serviceData);

      // Bu hizmete atanmış çalışanları yükle
      try {
        const allEmployees = await employeesApi.getAll();
        if (Array.isArray(allEmployees)) {
          const serviceEmployees = allEmployees.filter((emp: any) => 
            emp.employeeServices?.some((es: any) => 
              (es.service?.id || es.serviceId) === serviceId
            )
          );
          setEmployees(serviceEmployees || []);
        } else {
          setEmployees([]);
        }
      } catch (error) {
        console.error('Error loading employees:', error);
        setEmployees([]);
      }

      // Bu hizmet için yapılmış randevuları yükle
      try {
        const allAppointments = await appointmentsApi.getAll();
        if (Array.isArray(allAppointments)) {
          const serviceAppointments = allAppointments.filter(
            (apt: any) => (apt.serviceId || apt.service_id) === serviceId
          );
          setAppointments(serviceAppointments || []);
        } else {
          setAppointments([]);
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
        setAppointments([]);
      }
    } catch (error: any) {
      console.error('Error loading service data:', error);
      const errorMessage = error?.message || 'Hizmet yüklenirken hata oluştu.';
      alert(errorMessage);
      router.push('/services');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) return;

    try {
      await servicesApi.delete(serviceId);
      alert('Hizmet başarıyla silindi!');
      router.push('/services');
    } catch (error: any) {
      console.error('Error deleting service:', error);
      const errorMessage = error?.message || 'Hizmet silinirken hata oluştu.';
      alert(errorMessage);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-600/20 text-blue-300 border border-blue-600/30'
      case 'completed':
        return 'bg-green-600/20 text-green-300 border border-green-600/30'
      case 'cancelled':
        return 'bg-red-600/20 text-red-300 border border-red-600/30'
      default:
        return 'bg-gray-600/20 text-gray-300 border border-gray-600/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Planlandı'
      case 'completed':
        return 'Tamamlandı'
      case 'cancelled':
        return 'İptal Edildi'
      default:
        return status
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
          <span className="text-gray-300">Yükleniyor...</span>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300">Hizmet bulunamadı</p>
          <button
            onClick={() => router.push('/services')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Hizmetlere Dön
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/services')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Geri</span>
              </button>
              <div className="h-6 w-px bg-gray-600"></div>
              <h1 className="text-xl font-semibold text-white">
                {capitalizeName(service.name)}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/services/${service.id}/edit`)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Edit size={16} />
                <span>Düzenle</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                <span>Sil</span>
              </button>
              <div className="relative profile-menu">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <User size={20} />
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 z-50">
                    <button
                      onClick={() => {
                        removeToken();
                        router.push('/login');
                      }}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <LogOut size={16} />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Kolon - Hizmet Bilgileri */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hizmet Detayları */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Settings size={20} />
                <span>Hizmet Detayları</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Hizmet Adı</label>
                  <p className="text-white font-medium">{capitalizeName(service.name)}</p>
                </div>

                {service.description && (
                  <div>
                    <label className="text-sm text-gray-400">Açıklama</label>
                    <p className="text-white">{service.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Fiyat</label>
                    <div className="flex items-center space-x-2">
                      <DollarSign size={16} className="text-green-400" />
                      <p className="text-white font-semibold text-lg">
                        {formatCurrency(service.price || 0)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Süre</label>
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className="text-blue-400" />
                      <p className="text-white font-semibold">{service.duration || 0} dakika</p>
                    </div>
                  </div>
                </div>

                {(service.createdAt || service.created_at) && (
                  <div>
                    <label className="text-sm text-gray-400">Eklenme Tarihi</label>
                    <p className="text-white">
                      {formatDateTime(service.createdAt || service.created_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Randevular */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Calendar size={20} />
                <span>Randevular ({appointments.length})</span>
              </h2>

              {appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.slice(0, 10).map((appointment: any) => (
                    <div
                      key={appointment.id}
                      className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors cursor-pointer"
                      onClick={() => router.push(`/appointments/${appointment.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-white font-medium">
                              {appointment.customer?.name || appointment.customerName || 'Müşteri Bilgisi Yok'}
                            </span>
                            {appointment.employee && (
                              <span className="text-gray-400">
                                - {appointment.employee.name || appointment.employeeName}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>
                              {formatDateTime(appointment.startTime || appointment.start_time)}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(appointment.status)}`}>
                              {getStatusText(appointment.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {appointments.length > 10 && (
                    <p className="text-center text-gray-400 text-sm">
                      +{appointments.length - 10} randevu daha...
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">Bu hizmet için henüz randevu yok.</p>
              )}
            </div>
          </div>

          {/* Sağ Kolon - Çalışanlar */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Users size={20} />
                <span>Çalışanlar ({employees.length})</span>
              </h2>

              {employees.length > 0 ? (
                <div className="space-y-3">
                  {employees.map((employee: any) => (
                    <div
                      key={employee.id}
                      className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors cursor-pointer"
                      onClick={() => router.push(`/employees/${employee.id}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                          <User size={20} className="text-gray-300" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {capitalizeName(employee.name)}
                          </p>
                          {employee.position && (
                            <p className="text-gray-400 text-sm">{employee.position}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  Bu hizmete henüz çalışan atanmamış.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
