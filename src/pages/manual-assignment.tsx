import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ErrorModal from '../components/ErrorModal';
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
        driverApi.getActive()
      ]);
      
      setPendingDeliveries(pendingRes.data);
      setAvailableDrivers(driversRes.data);
    } catch (error: any) {
      console.error('데이터 로딩 실패:', error);
      const message = error.response?.data?.message || '데이터 로딩 중 오류가 발생했습니다.';
      showError('데이터 로딩 실패', message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedDelivery || !selectedDriver) {
      showError('입력 오류', '배송과 기사를 선택해주세요.');
      return;
    }

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
    } catch (error: any) {
      const message = error.response?.data?.message || '배차 중 오류가 발생했습니다.';
      showError('배차 실패', message);
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
    } catch (error: any) {
      const message = error.response?.data?.message || '추천 기사 조회 중 오류가 발생했습니다.';
      showError('추천 실패', message);
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
                              className="btn btn-outline-info btn-sm shadow-sm"
                              style={{
                                borderRadius: '20px',
                                borderWidth: '2px',
                                transition: 'all 0.3s ease'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDelivery(delivery);
                                getRecommendation(delivery);
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.05)';
                                e.target.style.backgroundColor = '#17a2b8';
                                e.target.style.color = '#fff';
                                e.target.style.boxShadow = '0 4px 12px rgba(23, 162, 184, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#17a2b8';
                                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                              }}
                              title="AI 추천 기사"
                            >
                              <i className="bi bi-robot me-1"></i>
                              🤖 추천
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
                      <label className="form-label fw-semibold text-dark">
                        <i className="bi bi-person-fill text-primary me-2"></i>
                        배정할 기사 선택
                      </label>
                      <select
                        className="form-select form-select-lg shadow-sm border-2"
                        style={{ 
                          borderColor: '#e3f2fd',
                          backgroundColor: '#fafafa',
                          transition: 'all 0.3s ease'
                        }}
                        value={selectedDriver}
                        onChange={(e) => setSelectedDriver(e.target.value)}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#2196f3';
                          e.target.style.backgroundColor = '#ffffff';
                          e.target.style.boxShadow = '0 0 0 0.2rem rgba(33, 150, 243, 0.25)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e3f2fd';
                          e.target.style.backgroundColor = '#fafafa';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="">🚛 기사를 선택하세요</option>
                        {availableDrivers.map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            👨‍💼 {driver.name} ({driver.vehicleNumber}) - {driver.tonnage}톤
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 배차 확정 버튼 */}
                    <div className="d-grid">
                      <button
                        className="btn btn-primary btn-lg shadow-sm"
                        style={{
                          borderRadius: '25px',
                          background: assigning ? '#6c757d' : 'linear-gradient(45deg, #007bff, #0056b3)',
                          border: 'none',
                          transition: 'all 0.3s ease',
                          padding: '12px 24px'
                        }}
                        onClick={handleAssign}
                        disabled={!selectedDriver || assigning}
                        onMouseEnter={(e) => {
                          if (!assigning && selectedDriver) {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(0,123,255,0.4)';
                            e.target.style.background = 'linear-gradient(45deg, #0056b3, #004085)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!assigning && selectedDriver) {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                            e.target.style.background = 'linear-gradient(45deg, #007bff, #0056b3)';
                          }
                        }}
                      >
                        {assigning ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            ⏳ 배차 처리 중...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle-fill me-2"></i>
                            🎯 배차 확정
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

export default ManualAssignmentPage;