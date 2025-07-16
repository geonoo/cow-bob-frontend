import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { deliveryApi, driverApi } from '../services/apiClient';
import { Driver, Delivery } from '../types';

const ManualAssignmentPage: React.FC = () => {
  const [pendingDeliveries, setPendingDeliveries] = useState<Delivery[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingRes, driversRes] = await Promise.all([
        deliveryApi.getPending(),
        driverApi.getActive()
      ]);
      
      setPendingDeliveries(pendingRes.data);
      setAvailableDrivers(driversRes.data);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      setMessage('데이터 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedDelivery || !selectedDriver) return;

    setAssigning(true);
    setMessage('');

    try {
      await deliveryApi.assign(selectedDelivery.id, parseInt(selectedDriver));
      setMessage('배차가 성공적으로 완료되었습니다.');
      
      // 데이터 새로고침
      await fetchData();
      
      // 선택 초기화
      setSelectedDelivery(null);
      setSelectedDriver('');
    } catch (error) {
      setMessage('배차 중 오류가 발생했습니다.');
      console.error('배차 실패:', error);
    } finally {
      setAssigning(false);
    }
  };

  const getRecommendation = async (delivery: Delivery) => {
    try {
      const response = await deliveryApi.recommendDriver(delivery.id);
      const recommendation = response.data;
      
      if (recommendation.recommendedDriver) {
        setSelectedDriver(recommendation.recommendedDriver.id.toString());
        setMessage(`추천 기사: ${recommendation.recommendedDriver.name} (${recommendation.message || ''})`);
      } else {
        setMessage(recommendation.message || '추천할 수 있는 기사가 없습니다.');
      }
    } catch (error) {
      setMessage('추천 기사 조회 중 오류가 발생했습니다.');
      console.error('추천 실패:', error);
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
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">직접 배차 관리</h1>
          <p className="mt-2 text-gray-600">대기 중인 배송에 기사를 직접 배정합니다</p>
        </div>

        {message && (
          <div className={`p-4 rounded-md ${
            message.includes('성공') || message.includes('추천') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 대기 중인 배송 목록 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                대기 중인 배송 ({pendingDeliveries.length}건)
              </h3>
              
              {pendingDeliveries.length === 0 ? (
                <p className="text-gray-500 text-center py-8">대기 중인 배송이 없습니다.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {pendingDeliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedDelivery?.id === delivery.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedDelivery(delivery);
                        setSelectedDriver('');
                        setMessage('');
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{delivery.destination}</h4>
                          <p className="text-sm text-gray-600 mt-1">{delivery.address}</p>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                            <span>🚛 {delivery.feedTonnage}톤</span>
                            <span>💰 {delivery.price.toLocaleString()}원</span>
                            <span>📅 {new Date(delivery.deliveryDate).toLocaleDateString('ko-KR')}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDelivery(delivery);
                            getRecommendation(delivery);
                          }}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                        >
                          추천 기사
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 배차 설정 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">배차 설정</h3>
              
              {selectedDelivery ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">선택된 배송</h4>
                    <p className="text-sm text-gray-600">{selectedDelivery.destination}</p>
                    <p className="text-sm text-gray-500">{selectedDelivery.address}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>🚛 {selectedDelivery.feedTonnage}톤</span>
                      <span>💰 {selectedDelivery.price.toLocaleString()}원</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      배정할 기사 선택
                    </label>
                    <select
                      value={selectedDriver}
                      onChange={(e) => setSelectedDriver(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">기사를 선택하세요</option>
                      {availableDrivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} ({driver.vehicleNumber}) - {driver.tonnage}톤
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleAssign}
                    disabled={!selectedDriver || assigning}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {assigning ? '배차 중...' : '배차 확정'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>배차할 배송을 선택하세요</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 활성 기사 현황 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              활성 기사 현황 ({availableDrivers.length}명)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableDrivers.map((driver) => (
                <div key={driver.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{driver.name}</h4>
                      <p className="text-sm text-gray-600">{driver.vehicleNumber}</p>
                      <p className="text-sm text-gray-500">{driver.tonnage}톤 {driver.vehicleType}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      driver.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      driver.status === 'ON_VACATION' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {driver.status === 'ACTIVE' ? '활성' :
                       driver.status === 'ON_VACATION' ? '휴가' : '비활성'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManualAssignmentPage;