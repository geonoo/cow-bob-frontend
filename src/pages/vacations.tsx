import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vacationsRes, driversRes] = await Promise.all([
        vacationApi.getAll(),
        driverApi.getAll(),
      ]);
      
      setVacations(vacationsRes.data);
      setDrivers(driversRes.data);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedDriver = drivers.find(d => d.id === formData.driverId);
      if (!selectedDriver) return;

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
    } catch (error) {
      console.error('휴가 신청 실패:', error);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await vacationApi.approve(id);
      await fetchData();
    } catch (error) {
      console.error('휴가 승인 실패:', error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await vacationApi.reject(id);
      await fetchData();
    } catch (error) {
      console.error('휴가 반려 실패:', error);
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">휴가 관리</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            휴가 신청
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  기사명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  휴가 기간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사유
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  신청일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vacations.map((vacation) => (
                <tr key={vacation.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {vacation.driver.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(vacation.startDate).toLocaleDateString('ko-KR')} ~ {' '}
                    {new Date(vacation.endDate).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {vacation.reason || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(vacation.requestDate).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vacation.status)}`}>
                      {getStatusText(vacation.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
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
              ))}
            </tbody>
          </table>
        </div>

        {/* 모달 */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">휴가 신청</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">기사 선택</label>
                    <select
                      value={formData.driverId}
                      onChange={(e) => setFormData({ ...formData, driverId: parseInt(e.target.value) })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    >
                      <option value={0}>기사를 선택하세요</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} ({driver.vehicleNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">시작일</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">종료일</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">사유</label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      rows={3}
                      placeholder="휴가 사유를 입력하세요"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      신청
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VacationsPage;