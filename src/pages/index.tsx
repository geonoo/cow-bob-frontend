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
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">로딩 중...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-fluid">
        {/* 페이지 헤더 */}
        <div className="row mb-4">
          <div className="col-12 text-center">
            <h1 className="display-4 fw-bold text-primary mb-3">📊 대시보드</h1>
            <p className="lead text-muted">물류 배차 시스템 현황을 한눈에 확인하세요</p>
          </div>
        </div>

        {/* 빠른 액션 버튼 */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title text-center mb-4">⚡ 빠른 액션</h5>
                <div className="row g-3">
                  <div className="col-6 col-md-3">
                    <button 
                      className="btn btn-primary w-100 py-3 rounded-3"
                      onClick={() => window.location.href = '/manual-assignment'}
                    >
                      <div className="fs-4 mb-1">🎯</div>
                      <div className="small">직접 배차</div>
                    </button>
                  </div>
                  <div className="col-6 col-md-3">
                    <button 
                      className="btn btn-success w-100 py-3 rounded-3"
                      onClick={() => window.location.href = '/history'}
                    >
                      <div className="fs-4 mb-1">📋</div>
                      <div className="small">과거 데이터</div>
                    </button>
                  </div>
                  <div className="col-6 col-md-3">
                    <button 
                      className="btn btn-info w-100 py-3 rounded-3"
                      onClick={() => window.location.href = '/drivers'}
                    >
                      <div className="fs-4 mb-1">👨‍💼</div>
                      <div className="small">기사 관리</div>
                    </button>
                  </div>
                  <div className="col-6 col-md-3">
                    <button 
                      className="btn btn-warning w-100 py-3 rounded-3"
                      onClick={() => window.location.href = '/deliveries'}
                    >
                      <div className="fs-4 mb-1">📦</div>
                      <div className="small">배송 관리</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="row mb-4">
          <div className="col-6 col-lg-3 mb-3">
            <div className="card bg-primary text-white h-100 shadow-sm">
              <div className="card-body d-flex align-items-center">
                <div className="me-3">
                  <div className="display-6">👨‍💼</div>
                </div>
                <div>
                  <div className="small opacity-75">전체 기사</div>
                  <div className="h4 mb-0">{stats.totalDrivers}명</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-6 col-lg-3 mb-3">
            <div className="card bg-success text-white h-100 shadow-sm">
              <div className="card-body d-flex align-items-center">
                <div className="me-3">
                  <div className="display-6">✅</div>
                </div>
                <div>
                  <div className="small opacity-75">활성 기사</div>
                  <div className="h4 mb-0">{stats.activeDrivers}명</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-6 col-lg-3 mb-3">
            <div className="card bg-warning text-white h-100 shadow-sm">
              <div className="card-body d-flex align-items-center">
                <div className="me-3">
                  <div className="display-6">⏳</div>
                </div>
                <div>
                  <div className="small opacity-75">대기 배송</div>
                  <div className="h4 mb-0">{stats.pendingDeliveries}건</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-6 col-lg-3 mb-3">
            <div className="card bg-info text-white h-100 shadow-sm">
              <div className="card-body d-flex align-items-center">
                <div className="me-3">
                  <div className="display-6">🎯</div>
                </div>
                <div>
                  <div className="small opacity-75">완료 배송</div>
                  <div className="h4 mb-0">{stats.completedDeliveries}건</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 배송 목록 */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="card-title mb-0">📋 최근 배송 현황</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="px-3 py-3">배송지</th>
                        <th className="px-3 py-3 d-none d-sm-table-cell">사료량</th>
                        <th className="px-3 py-3 d-none d-sm-table-cell">가격</th>
                        <th className="px-3 py-3">기사</th>
                        <th className="px-3 py-3">상태</th>
                        <th className="px-3 py-3 d-none d-md-table-cell">배송일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentDeliveries.map((delivery) => (
                        <tr key={delivery.id}>
                          <td className="px-3 py-3">
                            <div className="fw-medium">{delivery.destination}</div>
                            <div className="small text-muted d-sm-none">
                              {delivery.feedTonnage}톤 · {delivery.price.toLocaleString()}원
                            </div>
                          </td>
                          <td className="px-3 py-3 d-none d-sm-table-cell">
                            <span className="badge bg-secondary">{delivery.feedTonnage}톤</span>
                          </td>
                          <td className="px-3 py-3 d-none d-sm-table-cell">
                            <span className="fw-medium">{delivery.price.toLocaleString()}원</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-truncate" style={{ maxWidth: '100px' }}>
                              {delivery.driver?.name || '미배정'}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`badge ${
                              delivery.status === 'COMPLETED' ? 'bg-success' :
                              delivery.status === 'ASSIGNED' ? 'bg-primary' :
                              'bg-warning'
                            }`}>
                              {delivery.status === 'COMPLETED' ? '완료' :
                               delivery.status === 'ASSIGNED' ? '배정됨' : '대기'}
                            </span>
                          </td>
                          <td className="px-3 py-3 d-none d-md-table-cell">
                            <small className="text-muted">
                              {new Date(delivery.deliveryDate).toLocaleDateString('ko-KR')}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;