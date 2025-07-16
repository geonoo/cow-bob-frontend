import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
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
      <div className="container-fluid">
        {/* 페이지 헤더 */}
        <div className="row mb-4">
          <div className="col-12 text-center">
            <h1 className="display-4 fw-bold text-primary mb-3">🎯 직접 배차 관리</h1>
            <p className="lead text-muted">대기 중인 배송에 기사를 직접 배정합니다</p>
          </div>
        </div>

        {/* 알림 메시지 */}
        {message && (
          <div className="row mb-4">
            <div className="col-12">
              <div className={`alert ${
                message.includes('성공') || message.includes('추천') ? 'alert-success' : 'alert-danger'
              } alert-dismissible fade show`} role="alert">
                <i className={`bi ${
                  message.includes('성공') || message.includes('추천') ? 'bi-check-circle' : 'bi-exclamation-triangle'
                } me-2`}></i>
                {message}
                <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
              </div>
            </div>
          </div>
        )}

        <div className="row g-4">
          {/* 대기 중인 배송 목록 */}
          <div className="col-lg-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-warning text-white">
                <h5 className="card-title mb-0">
                  <i className="bi bi-clock me-2"></i>
                  대기 중인 배송 ({pendingDeliveries.length}건)
                </h5>
              </div>
              <div className="card-body">
                {pendingDeliveries.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-inbox display-1 mb-3"></i>
                    <p>대기 중인 배송이 없습니다.</p>
                  </div>
                ) : (
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {pendingDeliveries.map((delivery) => (
                      <div
                        key={delivery.id}
                        className={`card mb-3 cursor-pointer ${
                          selectedDelivery?.id === delivery.id
                            ? 'border-primary bg-primary bg-opacity-10'
                            : 'border-light'
                        }`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setSelectedDriver('');
                          setMessage('');
                        }}
                      >
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <h6 className="card-title mb-1">{delivery.destination}</h6>
                              <p className="card-text small text-muted mb-2">{delivery.address}</p>
                              <div className="d-flex flex-wrap gap-2">
                                <span className="badge bg-secondary">
                                  <i className="bi bi-truck me-1"></i>
                                  {delivery.feedTonnage}톤
                                </span>
                                <span className="badge bg-success">
                                  <i className="bi bi-currency-dollar me-1"></i>
                                  {delivery.price.toLocaleString()}원
                                </span>
                                <span className="badge bg-info">
                                  <i className="bi bi-calendar me-1"></i>
                                  {new Date(delivery.deliveryDate).toLocaleDateString('ko-KR')}
                                </span>
                              </div>
                            </div>
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDelivery(delivery);
                                getRecommendation(delivery);
                              }}
                            >
                              <i className="bi bi-robot me-1"></i>
                              추천
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 배차 설정 */}
          <div className="col-lg-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-primary text-white">
                <h5 className="card-title mb-0">
                  <i className="bi bi-gear me-2"></i>
                  배차 설정
                </h5>
              </div>
              <div className="card-body">
                {selectedDelivery ? (
                  <div>
                    {/* 선택된 배송 정보 */}
                    <div className="alert alert-info">
                      <h6 className="alert-heading">
                        <i className="bi bi-check-circle me-2"></i>
                        선택된 배송
                      </h6>
                      <hr />
                      <p className="mb-1 fw-bold">{selectedDelivery.destination}</p>
                      <p className="mb-2 text-muted small">{selectedDelivery.address}</p>
                      <div className="d-flex gap-3">
                        <span className="badge bg-secondary">
                          <i className="bi bi-truck me-1"></i>
                          {selectedDelivery.feedTonnage}톤
                        </span>
                        <span className="badge bg-success">
                          <i className="bi bi-currency-dollar me-1"></i>
                          {selectedDelivery.price.toLocaleString()}원
                        </span>
                      </div>
                    </div>

                    {/* 기사 선택 */}
                    <div className="mb-4">
                      <label className="form-label">
                        <i className="bi bi-person me-1"></i>
                        배정할 기사 선택
                      </label>
                      <select
                        className="form-select"
                        value={selectedDriver}
                        onChange={(e) => setSelectedDriver(e.target.value)}
                      >
                        <option value="">기사를 선택하세요</option>
                        {availableDrivers.map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.name} ({driver.vehicleNumber}) - {driver.tonnage}톤
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 배차 확정 버튼 */}
                    <div className="d-grid">
                      <button
                        className="btn btn-primary btn-lg"
                        onClick={handleAssign}
                        disabled={!selectedDriver || assigning}
                      >
                        {assigning ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            배차 중...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            배차 확정
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-arrow-left-circle display-1 mb-3"></i>
                    <p>배차할 배송을 선택하세요</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 활성 기사 현황 */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-success text-white">
                <h5 className="card-title mb-0">
                  <i className="bi bi-people me-2"></i>
                  활성 기사 현황 ({availableDrivers.length}명)
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {availableDrivers.map((driver) => (
                    <div key={driver.id} className="col-md-6 col-lg-4">
                      <div className="card border-light">
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="card-title mb-1">{driver.name}</h6>
                              <p className="card-text small text-muted mb-1">{driver.vehicleNumber}</p>
                              <p className="card-text small text-muted">{driver.tonnage}톤 {driver.vehicleType}</p>
                            </div>
                            <span className={`badge ${
                              driver.status === 'ACTIVE' ? 'bg-success' :
                              driver.status === 'ON_VACATION' ? 'bg-warning' :
                              'bg-secondary'
                            }`}>
                              {driver.status === 'ACTIVE' ? '활성' :
                               driver.status === 'ON_VACATION' ? '휴가' : '비활성'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManualAssignmentPage;