import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ErrorModal from '../components/ErrorModal';
import { vacationApi, driverApi } from '../services/apiClient';
import { Vacation, Driver } from '../types';

const VacationsPage: React.FC = () => {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    driverId: 0,
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [errorModal, setErrorModal] = useState({ show: false, title: '', message: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const showError = (title: string, message: string) => {
    setErrorModal({ show: true, title, message });
  };

  const fetchData = async () => {
    try {
      const [vacationsRes, driversRes] = await Promise.all([
        vacationApi.getAll(),
        driverApi.getAll(),
      ]);
      
      // vacations가 배열인지 확인하고 안전하게 설정
      setVacations(Array.isArray(vacationsRes.data) ? vacationsRes.data : []);
      setDrivers(Array.isArray(driversRes.data) ? driversRes.data : []);
    } catch (error: any) {
      console.error('데이터 로딩 실패:', error);
      const message = error.response?.data?.message || '데이터를 불러오는데 실패했습니다.';
      showError('데이터 로딩 실패', message);
      setVacations([]);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedDriver = drivers.find(d => d.id === formData.driverId);
      if (!selectedDriver) {
        showError('입력 오류', '기사를 선택해주세요.');
        return;
      }

      const vacationData = {
        driver: selectedDriver,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        status: 'PENDING' as const,
      };

      await vacationApi.create(vacationData);
      await fetchData();
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      console.error('휴가 신청 실패:', error);
      const message = error.response?.data?.message || '휴가 신청에 실패했습니다.';
      showError('휴가 신청 실패', message);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await vacationApi.approve(id);
      await fetchData();
    } catch (error: any) {
      console.error('휴가 승인 실패:', error);
      const message = error.response?.data?.message || '휴가 승인에 실패했습니다.';
      showError('휴가 승인 실패', message);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await vacationApi.reject(id);
      await fetchData();
    } catch (error: any) {
      console.error('휴가 반려 실패:', error);
      const message = error.response?.data?.message || '휴가 반려에 실패했습니다.';
      showError('휴가 반려 실패', message);
    }
  };

  const resetForm = () => {
    setFormData({
      driverId: 0,
      startDate: '',
      endDate: '',
      reason: '',
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '대기';
      case 'APPROVED': return '승인';
      case 'REJECTED': return '반려';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
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
          <h1 className="text-3xl font-bold text-gray-900">휴가 관리</h1>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm"
          >
            휴가 신청
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    기사명
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    휴가 기간
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사유
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    신청일
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
                {Array.isArray(vacations) && vacations.length > 0 ? (
                  vacations.map((vacation) => (
                    <tr key={vacation.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {vacation.driver?.name || '알 수 없음'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(vacation.startDate).toLocaleDateString('ko-KR')} ~ {' '}
                        {new Date(vacation.endDate).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {vacation.reason || '-'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(vacation.requestDate).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vacation.status)}`}>
                          {getStatusText(vacation.status)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {vacation.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(vacation.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              승인
                            </button>
                            <button
                              onClick={() => handleReject(vacation.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              반려
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 sm:px-6 py-8 text-center text-gray-500">
                      휴가 신청 내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 모달 */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-6 border w-full max-w-md shadow-xl rounded-lg bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-6">휴가 신청</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">기사 선택</label>
                    <select
                      value={formData.driverId}
                      onChange={(e) => setFormData({ ...formData, driverId: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value={0}>기사를 선택하세요</option>
                      {Array.isArray(drivers) && drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} ({driver.vehicleNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">시작일</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">종료일</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">사유</label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      rows={3}
                      placeholder="휴가 사유를 입력하세요"
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
                      신청
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

export default VacationsPage;