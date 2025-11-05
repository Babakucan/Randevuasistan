'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Building, Edit, Trash2, Phone, Mail, MapPin, User, ArrowLeft, Settings } from 'lucide-react';
import { salonsApi, authApi, getToken, removeToken, getCurrentSalonId, setCurrentSalonId } from '@/lib/api';
import Link from 'next/link';

export default function SalonsPage() {
  const router = useRouter();
  const [salons, setSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    description: '',
  });

  useEffect(() => {
    checkUserAndLoadSalons();
  }, []);

  const checkUserAndLoadSalons = async () => {
    try {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const user = await authApi.getCurrentUser();
      if (user && user.salonProfiles) {
        setSalons(user.salonProfiles);
      }
    } catch (error) {
      console.error('Error loading salons:', error);
      removeToken();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await salonsApi.create(formData);
      setShowAddModal(false);
      setFormData({
        name: '',
        ownerName: '',
        phone: '',
        email: '',
        address: '',
        description: '',
      });
      await checkUserAndLoadSalons();
      alert('Salon başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Error creating salon:', error);
      alert('Salon oluşturulurken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  };

  const handleEditSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalon) return;

    try {
      await salonsApi.update(selectedSalon.id, formData);
      setShowEditModal(false);
      setSelectedSalon(null);
      setFormData({
        name: '',
        ownerName: '',
        phone: '',
        email: '',
        address: '',
        description: '',
      });
      await checkUserAndLoadSalons();
      alert('Salon başarıyla güncellendi!');
    } catch (error) {
      console.error('Error updating salon:', error);
      alert('Salon güncellenirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  };

  const handleDeleteSalon = async (salonId: string) => {
    if (!confirm('Bu salonu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      await salonsApi.delete(salonId);
      await checkUserAndLoadSalons();
      
      // Eğer silinen salon aktif salon ise, ilk salonu seç
      if (getCurrentSalonId() === salonId && salons.length > 1) {
        const remainingSalons = salons.filter(s => s.id !== salonId);
        if (remainingSalons.length > 0) {
          setCurrentSalonId(remainingSalons[0].id);
        } else {
          removeToken();
          router.push('/login');
        }
      }
      
      alert('Salon başarıyla silindi!');
    } catch (error) {
      console.error('Error deleting salon:', error);
      alert('Salon silinirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  };

  const handleSelectSalon = (salonId: string) => {
    setCurrentSalonId(salonId);
    alert('Aktif salon değiştirildi!');
    router.push('/dashboard');
  };

  const openEditModal = (salon: any) => {
    setSelectedSalon(salon);
    setFormData({
      name: salon.name || '',
      ownerName: salon.ownerName || '',
      phone: salon.phone || '',
      email: salon.email || '',
      address: salon.address || '',
      description: salon.description || '',
    });
    setShowEditModal(true);
  };

  const currentSalonId = getCurrentSalonId();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard'a Dön
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Salon Yönetimi</h1>
              <p className="text-gray-400 mt-2">Salonlarınızı yönetin ve yeni salon ekleyin</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Yeni Salon Ekle</span>
            </button>
          </div>
        </div>

        {/* Salons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salons.map((salon) => (
            <div
              key={salon.id}
              className={`bg-gray-800 border-2 rounded-xl p-6 ${
                currentSalonId === salon.id
                  ? 'border-blue-500 ring-2 ring-blue-500'
                  : 'border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{salon.name}</h3>
                    {currentSalonId === salon.id && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded mt-1">
                        Aktif Salon
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(salon)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    title="Düzenle"
                  >
                    <Edit className="w-4 h-4 text-gray-300" />
                  </button>
                  {salons.length > 1 && (
                    <button
                      onClick={() => handleDeleteSalon(salon.id)}
                      className="p-2 bg-gray-700 hover:bg-red-600 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4 text-gray-300" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {salon.ownerName && (
                  <div className="flex items-center text-gray-400 text-sm">
                    <User className="w-4 h-4 mr-2" />
                    {salon.ownerName}
                  </div>
                )}
                {salon.phone && (
                  <div className="flex items-center text-gray-400 text-sm">
                    <Phone className="w-4 h-4 mr-2" />
                    {salon.phone}
                  </div>
                )}
                {salon.email && (
                  <div className="flex items-center text-gray-400 text-sm">
                    <Mail className="w-4 h-4 mr-2" />
                    {salon.email}
                  </div>
                )}
                {salon.address && (
                  <div className="flex items-center text-gray-400 text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="truncate">{salon.address}</span>
                  </div>
                )}
              </div>

              {salon.description && (
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{salon.description}</p>
              )}

              <div className="flex space-x-2">
                {currentSalonId !== salon.id && (
                  <button
                    onClick={() => handleSelectSalon(salon.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Aktif Salon Yap
                  </button>
                )}
                <button
                  onClick={() => openEditModal(salon)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <Settings className="w-4 h-4 inline mr-1" />
                  Düzenle
                </button>
              </div>
            </div>
          ))}
        </div>

        {salons.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Henüz salon eklenmemiş</h3>
            <p className="text-gray-500 mb-4">İlk salonunuzu ekleyerek başlayın</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Salon Ekle
            </button>
          </div>
        )}

        {/* Add Salon Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Yeni Salon Ekle</h2>
              <form onSubmit={handleAddSalon} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Salon Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Salon Adı"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sahip Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Sahip Adı"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+90 5XX XXX XX XX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="salon@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Adres
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Salon Adresi"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Salon açıklaması"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({
                        name: '',
                        ownerName: '',
                        phone: '',
                        email: '',
                        address: '',
                        description: '',
                      });
                    }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Salon Ekle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Salon Modal */}
        {showEditModal && selectedSalon && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Salon Düzenle</h2>
              <form onSubmit={handleEditSalon} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Salon Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Salon Adı"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sahip Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Sahip Adı"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+90 5XX XXX XX XX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="salon@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Adres
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Salon Adresi"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Salon açıklaması"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedSalon(null);
                      setFormData({
                        name: '',
                        ownerName: '',
                        phone: '',
                        email: '',
                        address: '',
                        description: '',
                      });
                    }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Güncelle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

