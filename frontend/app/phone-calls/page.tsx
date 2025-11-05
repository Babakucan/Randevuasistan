'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, getToken, removeToken } from '@/lib/api';
import { capitalizeName } from '@/lib/utils';
import { 
  Phone, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  Clock,
  User,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  LogOut
} from 'lucide-react';

interface PhoneCall {
  id: string;
  customer_name: string;
  phone_number: string;
  call_type: string;
  duration: number;
  notes: string;
  created_at: string;
}

export default function PhoneCallsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [calls, setCalls] = useState<PhoneCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
      const currentUser = await authApi.getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      await loadCalls(currentUser.id);
    } catch (error) {
      console.error('Error checking user:', error);
      removeToken();
      router.push('/login');
    }
  };

  const loadCalls = async (userId: string) => {
    try {
      // TODO: Implement phone calls API when backend is ready
      // For now, set empty array to prevent errors
      setCalls([]);
    } catch (error) {
      console.error('Error loading calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCalls = calls.filter(call =>
    capitalizeName(call.customer_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.phone_number.includes(searchTerm) ||
    call.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (callId: string) => {
    if (!confirm('Bu aramayı silmek istediğinizden emin misiniz?')) return;

    try {
      // TODO: Implement phone call delete API when backend is ready
      setCalls(prev => prev.filter(call => call.id !== callId));
      alert('Arama başarıyla silindi!');
    } catch (error) {
      console.error('Error deleting call:', error);
      alert('Arama silinirken hata oluştu.');
    }
  };

  const getCallTypeIcon = (type: string) => {
    switch (type) {
      case 'incoming':
        return <PhoneIncoming className="w-4 h-4 text-green-400" />;
      case 'outgoing':
        return <PhoneOutgoing className="w-4 h-4 text-blue-400" />;
      case 'missed':
        return <PhoneMissed className="w-4 h-4 text-red-400" />;
      default:
        return <PhoneCall className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCallTypeText = (type: string) => {
    switch (type) {
      case 'incoming':
        return 'Gelen';
      case 'outgoing':
        return 'Giden';
      case 'missed':
        return 'Cevapsız';
      default:
        return 'Bilinmiyor';
    }
  };

  const getCallTypeColor = (type: string) => {
    switch (type) {
      case 'incoming':
        return 'text-green-400';
      case 'outgoing':
        return 'text-blue-400';
      case 'missed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
              <h1 className="text-2xl font-bold text-white">Telefon Aramaları</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">Toplam {calls.length} arama</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/phone-calls/new')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Arama</span>
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
                onClick={() => {
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
              placeholder="Arama ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {/* Calls Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Arama Türü
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Süre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Tarih & Saat
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Phone className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {capitalizeName(call.customer_name)}
                          </div>
                          <div className="text-sm text-gray-400">
                            {call.phone_number}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getCallTypeIcon(call.call_type)}
                        <span className={`text-sm font-medium ${getCallTypeColor(call.call_type)}`}>
                          {getCallTypeText(call.call_type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {formatDuration(call.duration)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {formatDateTime(call.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/phone-calls/${call.id}`)}
                          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-300" />
                        </button>
                        <button
                          onClick={() => router.push(`/phone-calls/${call.id}/edit`)}
                          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-300" />
                        </button>
                        <button
                          onClick={() => handleDelete(call.id)}
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

        {filteredCalls.length === 0 && (
          <div className="text-center py-12">
            <Phone className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Arama Bulunamadı</h3>
            <p className="text-gray-400">Arama kriterlerinize uygun arama bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}
