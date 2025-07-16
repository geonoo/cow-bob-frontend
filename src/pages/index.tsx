import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { driverApi, deliveryApi } from '../services/apiClient';
import { Driver, Delivery } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalDrivers: 0,
    activeDrivers: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
  });
  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driversRes, activeDriversRes, deliveriesRes, pendingRes] = await Promise.all([
          driverApi.getAll(),
          driverApi.getActive(),
          deliveryApi.getAll(),
          deliveryApi.getPending(),
        ]);

        const deliveries = deliveriesRes.data;
        const completedCount = deliveries.filter((d: Delivery) => d.status === 'COMPLETED').length;

        setStats({
          totalDrivers: driversRes.data.length,
          activeDrivers: activeDriversRes.data.length,
          pendingDeliveries: pendingRes.data.length,
          completedDeliveries: completedCount,
        });

        setRecentDeliveries(deliveries.slice(0, 5));
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
          <p className="mt-2 text-gray-600">물류 배차 시스템 현황을 한눈에 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">👨‍💼</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">전체 기사</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalDrivers}명</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">활성 기사</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.activeDrivers}명</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⏳</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">대기 배송</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.pendingDeliveries}건</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">완료 배송</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.completedDeliveries}건</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 배송 목록 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">최근 배송</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      배송지
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      사료량
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      가격
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      기사
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      배송일
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentDeliveries.map((delivery) => (
                    <tr key={delivery.id}>
                      <td className="px-3 py-4 text-sm font-medium text-gray-900">
                        <div className="truncate max-w-32 sm:max-w-none">
                          {delivery.destination}
                        </div>
                        <div className="text-xs text-gray-500 sm:hidden">
                          {delivery.feedTonnage}톤 · {delivery.price.toLocaleString()}원
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        {delivery.feedTonnage}톤
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        {delivery.price.toLocaleString()}원
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="truncate max-w-20 sm:max-w-none">
                          {delivery.driver?.name || '미배정'}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          delivery.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          delivery.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {delivery.status === 'COMPLETED' ? '완료' :
                           delivery.status === 'ASSIGNED' ? '배정됨' : '대기'}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {new Date(delivery.deliveryDate).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;