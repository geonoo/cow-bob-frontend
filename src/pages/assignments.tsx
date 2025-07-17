import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ErrorModal from '../components/ErrorModal';
import { deliveryApi, driverApi } from '../services/apiClient';
import { Delivery, Driver, DeliveryRecommendation } from '../types';

const AssignmentsPage: React.FC = () => {
  const [pendingDeliveries, setPendingDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [recommendations, setRecommendations] = useState<{ [key: number]: DeliveryRecommendation }>({});
  const [loading, setLoading] = useState(true);
  const [errorModal, setErrorModal] = useState({ show: false, title: '', message: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const showError = (title: string, message: string) => {
    setErrorModal({ show: true, title, message });
  };

  const fetchData = async () => {
    try {
      const [pendingRes, driversRes] = await Promise.all([
        deliveryApi.getPending(),
        driverApi.getActive(),
      ]);
      
      setPendingDeliveries(pendingRes.data);
      setDrivers(driversRes.data);
      
      // 각 배송에 대한 추천 기사 가져오기
      const recommendationPromises = pendingRes.data.map(async (delivery: Delivery) => {
        try {
          const recRes = await deliveryApi.recommendDriver(delivery.id);
          return { deliveryId: delivery.id, recommendation: recRes.data };
        } catch (error) {
          console.error(`배송 ${delivery.id} 추천 실패:`, error);
          return { deliveryId: delivery.id, recommendation: null };
        }
      });
      
      const recommendationResults = await Promise.all(recommendationPromises);
      const recommendationsMap: { [key: number]: DeliveryRecommendation } = {};
      
      recommendationResults.forEach(({ deliveryId, recommendation }) => {
        if (recommendation) {
          recommendationsMap[deliveryId] = recommendation;
        }
      });
      
      setRecommendations(recommendationsMap);
    } catch (error: any) {
      console.error('데이터 로딩 실패:', error);
      const message = error.response?.data?.message || '데이터를 불러오는데 실패했습니다.';
      showError('데이터 로딩 실패', message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (deliveryId: number, driverId: number) => {
    try {
      await deliveryApi.assign(deliveryId, driverId);
      await fetchData(); // 데이터 새로고침
    } catch (error: any) {
      console.error('배차 실패:', error);
      const message = error.response?.data?.message || '배차에 실패했습니다.';
      showError('배차 실패', message);
    }
  };

  const handleAutoAssign = async (deliveryId: number) => {
    const recommendation = recommendations[deliveryId];
    if (recommendation?.recommendedDriver) {
      await handleAssign(deliveryId, recommendation.recommendedDriver.id);
    } else {
      showError('배차 실패', '추천 기사가 없습니다.');
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
          <h1 className="text-3xl font-bold text-gray-900">배차 관리</h1>
          <p className="mt-2 text-gray-600">대기 중인 배송에 기사를 배정하세요</p>
        </div>

        {pendingDeliveries.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">배정 대기 중인 배송이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingDeliveries.map((delivery) => {
              const recommendation = recommendations[delivery.id];
              
              return (
                <div key={delivery.id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {delivery.destination}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{delivery.address}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <span>배송일: {new Date(delivery.deliveryDate).toLocaleDateString('ko-KR')}</span>
                        <span>가격: {delivery.price.toLocaleString()}원</span>
                      </div>
                      {delivery.notes && (
                        <p className="mt-2 text-sm text-gray-600">메모: {delivery.notes}</p>
                      )}
                    </div>
                    
                    <div className="ml-6 flex-shrink-0">
                      <div className="bg-gray-50 rounded-lg p-4 min-w-[300px]">
                        <h4 className="font-medium text-gray-900 mb-3">추천 기사</h4>
                        
                        {recommendation?.recommendedDriver ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-200">
                              <div>
                                <p className="font-medium text-blue-900">
                                  {recommendation.recommendedDriver.name}
                                </p>
                                <p className="text-sm text-blue-700">
                                  {recommendation.recommendedDriver.vehicleNumber} 
                                  ({recommendation.recommendedDriver.vehicleType})
                                </p>
                              </div>
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                추천
                              </span>
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleAutoAssign(delivery.id)}
                                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700"
                              >
                                추천 기사 배정
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-500 text-sm">
                              {recommendation?.message || '사용 가능한 기사가 없습니다.'}
                            </p>
                          </div>
                        )}
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">수동 배정</h5>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssign(delivery.id, parseInt(e.target.value));
                              }
                            }}
                            className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                            defaultValue=""
                          >
                            <option value="">기사 선택...</option>
                            {drivers.map((driver) => (
                              <option key={driver.id} value={driver.id}>
                                {driver.name} ({driver.vehicleNumber})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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

export default AssignmentsPage;