'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { employees } from '@/lib/supabase'
import { auth } from '@/lib/supabase'
import { Users, Plus, Search, Star, Clock, Phone, Mail, Edit, Trash2 } from 'lucide-react'

export default function EmployeesPage() {
  const [employeesList, setEmployeesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      const { data: { user } } = await auth.getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }

      console.log('Loading employees for user:', user.id)
      
      const { data, error } = await employees.getEmployees(user.id)
      console.log('Employees response:', { data, error })
      
      if (error) {
        console.error('Error loading employees:', error)
        setEmployeesList([])
      } else {
        setEmployeesList(data || [])
      }
    } catch (error) {
      console.error('Error in loadEmployees:', error)
      setEmployeesList([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEmployee = async (employeeId: string, employeeName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (confirm(`"${employeeName}" adlı çalışanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      try {
        const { data: { user } } = await auth.getCurrentUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { error } = await employees.deleteEmployee(user.id, employeeId)
        if (error) {
          console.error('Error deleting employee:', error)
          alert('Çalışan silinirken hata oluştu.')
        } else {
          alert('Çalışan başarıyla silindi.')
          // Çalışanları yeniden yükle
          await loadEmployees()
        }
      } catch (error) {
        console.error('Error deleting employee:', error)
        alert('Çalışan silinirken hata oluştu.')
      }
    }
  }

  const filteredEmployees = employeesList.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Çalışanlar</h1>
            <p className="text-gray-600 mt-2">Salon çalışanlarınızı yönetin</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Dashboard'a Dön
            </button>
            <button
              onClick={() => router.push('/employees/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Yeni Çalışan
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Çalışan ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Employees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              onClick={() => router.push(`/employees/${employee.id}`)}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-600">{employee.position}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-400" size={16} />
                    <span className="text-sm text-gray-600">{employee.experience_years} yıl</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/employees/${employee.id}/edit`)
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Düzenle"
                  >
                    <Edit size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteEmployee(employee.id, employee.name, e)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Sil"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {employee.specialties && (
                  <div className="flex flex-wrap gap-1">
                    {employee.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {employee.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <span>{employee.phone}</span>
                  </div>
                )}
                {employee.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span>{employee.email}</span>
                  </div>
                )}
                {employee.hourly_rate && (
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{employee.hourly_rate} TL/saat</span>
                  </div>
                )}
              </div>

              {employee.bio && (
                <p className="text-sm text-gray-500 mt-3 line-clamp-2">{employee.bio}</p>
              )}
            </div>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400" size={48} />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Henüz çalışan yok</h3>
            <p className="mt-2 text-gray-600">İlk çalışanınızı ekleyerek başlayın</p>
          </div>
        )}
      </div>
    </div>
  )
}
