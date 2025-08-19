'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { capitalizeName } from '@/lib/utils';
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
  LogOut
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  created_at: string;
}

export default function ServicesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      await loadServices(user.id);
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/login');
    }
  };

  const loadServices = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('salon_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profile) {
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('salon_id', profile.id)
          .order('created_at', { ascending: false });

        if (servicesData) {
          setServices(servicesData);
        }
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
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
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

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
                  await supabase.auth.signOut();
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
    </div>
  );
}
