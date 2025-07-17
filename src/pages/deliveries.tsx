import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { deliveryApi } from '../services/apiClient';
import { Delivery } from '../types';
import ErrorModal from '../components/ErrorModal';

const DeliveriesPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [formData, setFormData] = useState({
    destination: '',
    address: '',
    price: 0,
    feedTonnage: 0,
    deliveryDate: '',
    notes: '',
  });
  const [errorModal, setErrorModal] = useState({ show: false, title: '', message: '' });

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const showError = (title: string, message: string) => {
    setErrorModal({ show: true, title, message });
  };

  const fetchDeliveries = async () => {
    try {
      const response = await deliveryApi.getAll();
      setDeliveries(response.data);
    } catch (error: any) {
      console.error('배송 목록 로딩 실패:', error);
      const message = error.response?.data?.message || '배송 목록을 불러오는데 실패했습니다.';
      showError('배송 목록 로딩 실패', message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 유효성 검사
    if (!formData.destination.trim()) {
      showError('입력 오류', '배송지를 입력하세요.');
      return;
    }
    if (!formData.address.trim()) {
      showError('입력 오류', '주소를 입력하세요.');
      return;
    }
    if (formData.feedTonnage <= 0) {
      showError('입력 오류', '사료(톤)는 0보다 커야 합니다.');
      return;
    }
    if (formData.price <= 0) {
      showError('입력 오류', '가격은 0보다 커야 합니다.');
      return;
    }
    if (!formData.deliveryDate) {
      showError('입력 오류', '배송일을 선택하세요.');
      return;
    }
    try {
      if (editingDelivery) {
        await deliveryApi.update(editingDelivery.id, formData);
      } else {
        await deliveryApi.create(formData);
      }
      await fetchDeliveries();
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      const message = error.response?.data?.message || '배송 저장에 실패했습니다.';
      showError('배송 저장 실패', message);
      console.error('배송 저장 실패:', error);
    }
  };

  const handleEdit = (delivery: Delivery) => {
    setEditingDelivery(delivery);
    setFormData({
      destination: delivery.destination,
      address: delivery.address,
      price: delivery.price,
      feedTonnage: delivery.feedTonnage || 0,
      deliveryDate: delivery.deliveryDate,
      notes: delivery.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        await deliveryApi.delete(id);
        await fetchDeliveries();
      } catch (error: any) {
        console.error('배송 삭제 실패:', error);
        const message = error.response?.data?.message || '배송 삭제에 실패했습니다.';
        showError('배송 삭제 실패', message);
      }
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await deliveryApi.complete(id);
      await fetchDeliveries();
    } catch (error: any) {
      console.error('배송 완료 처리 실패:', error);
      const message = error.response?.data?.message || '배송 완료 처리에 실패했습니다.';
      showError('배송 완료 처리 실패', message);
    }
  };

  const resetForm = () => {
    setFormData({
      destination: '',
      address: '',
      price: 0,
      feedTonnage: 0,
      deliveryDate: '',
      notes: '',
    });
    setEditingDelivery(null);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '대기';
      case 'ASSIGNED': return '배정됨';
      case 'IN_PROGRESS': return '진행중';
      case 'COMPLETED': return '완료';
      case 'CANCELLED': return '취소';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">배송 관리</h1>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-600 shadow-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            배송 추가
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    배송지
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주소
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사료(톤)
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가격
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    배송일
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    기사
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {delivery.destination}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {delivery.address}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {delivery.feedTonnage || 0}톤
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {delivery.price.toLocaleString()}원
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(delivery.deliveryDate).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {delivery.driver?.name || '미배정'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(delivery.status)}`}>
                        {getStatusText(delivery.status)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(delivery)}
                        className="px-3 py-1 rounded-lg bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-sm transition-all duration-150"
                      >
                        수정
                      </button>
                      {delivery.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleComplete(delivery.id)}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-green-500 to-green-400 text-white hover:from-green-600 hover:to-green-500 shadow-sm transition-all duration-150"
                        >
                          완료
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(delivery.id)}
                        className="px-3 py-1 rounded-lg bg-gradient-to-r from-red-500 to-red-400 text-white hover:from-red-600 hover:to-red-500 shadow-sm transition-all duration-150"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 모달 */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-6 border w-full max-w-md shadow-xl rounded-lg bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  {editingDelivery ? '배송 수정' : '배송 추가'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">배송지</label>
                    <input
                      type="text"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-colors placeholder-gray-400 text-base"
                      placeholder="배송지명을 입력하세요"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">주소</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-colors placeholder-gray-400 text-base"
                      placeholder="배송 주소를 입력하세요"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">사료(톤)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.feedTonnage}
                        onChange={(e) => setFormData({ ...formData, feedTonnage: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">가격</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">배송일</label>
                    <input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">메모</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-colors placeholder-gray-400 text-base"
                      rows={3}
                      placeholder="배송 관련 메모를 입력하세요"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingDelivery ? '수정' : '추가'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* 오류 모달 */}
        <ErrorModal
          isOpen={errorModal.show}
          title={errorModal.title}
          message={errorModal.message}
          onClose={() => setErrorModal({ show: false, title: '', message: '' })}
        />
      </div>
    </Layout>
  );
};

export default DeliveriesPage;