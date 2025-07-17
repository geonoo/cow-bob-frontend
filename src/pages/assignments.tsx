import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ErrorModal from '../components/ErrorModal';
import { deliveryApi, driverApi } from '../services/apiClient';
import { Delivery, Driver } from '../types';

const AssignmentsPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorModal, setErrorModal] = useState({ show: false, title: '', message: '' });

  const showError = (title: string, message: string) => {
    setErrorModal({ show: true, title, message });
  };

  useEffect(() => {
    fetchDeliveries();
    fetchDrivers();
  }, []);

  const fetchDeliveries = async () => {
    try {
      console.log('배송 목록 요청');
      const response = await deliveryApi.getPending();
      console.log('배송 목록 응답:', response);
      setDeliveries(response.data);
    } catch (error: any) {
      console.error('배송 목록 로딩 실패 상세:', error);
      console.error('배송 목록 로딩 실패 응답:', error.response);
      console.error('배송 목록 로딩 실패 데이터:', error.response?.data);
      const message = error.response?.data?.message || error.message || '배송 목록을 불러오는데 실패했습니다.';
      showError('배송 목록 로딩 실패', message);
    }
  };

  const fetchDrivers = async () => {
    try {
      console.log('기사 목록 요청');
      const response = await driverApi.getActive();
      console.log('기사 목록 응답:', response);
      setDrivers(response.data);
    } catch (error: any) {
      console.error('기사 목록 로딩 실패 상세:', error);
      console.error('기사 목록 로딩 실패 응답:', error.response);
      console.error('기사 목록 로딩 실패 데이터:', error.response?.data);
      const message = error.response?.data?.message || error.message || '기사 목록을 불러오는데 실패했습니다.';
      showError('기사 목록 로딩 실패', message);
    }
  };

  const handleAssign = async (deliveryId: number, driverId: number) => {
    setLoading(true);
    setMessage('');

    try {
      console.log('배차 요청:', { deliveryId, driverId });
      const response = await deliveryApi.assign(deliveryId, driverId);
      console.log('배차 응답:', response);
      setMessage('배차가 성공적으로 완료되었습니다.');
      fetchDeliveries();
    } catch (error: any) {
      console.error('배차 실패 상세:', error);
      console.error('배차 실패 응답:', error.response);
      console.error('배차 실패 데이터:', error.response?.data);
      const message = error.response?.data?.message || error.message || '배차 중 오류가 발생했습니다.';
      showError('배차 실패', message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAssignment = async (deliveryId: number) => {
    try {
      console.log('배차 취소 요청:', { deliveryId });
      const response = await deliveryApi.cancelAssignment(deliveryId);
      console.log('배차 취소 응답:', response);
      setMessage('배차가 성공적으로 취소되었습니다.');
      fetchDeliveries();
    } catch (error: any) {
      console.error('배차 취소 실패 상세:', error);
      console.error('배차 취소 실패 응답:', error.response);
      console.error('배차 취소 실패 데이터:', error.response?.data);
      const message = error.response?.data?.message || error.message || '배차 취소 중 오류가 발생했습니다.';
      showError('배차 취소 실패', message);
    }
  };

  const handleRecommend = async (deliveryId: number) => {
    try {
      console.log('기사 추천 요청:', { deliveryId });
      const response = await deliveryApi.recommendDriver(deliveryId);
      console.log('기사 추천 응답:', response);
      setMessage('기사 추천이 완료되었습니다.');
      fetchDeliveries();
    } catch (error: any) {
      console.error('기사 추천 실패 상세:', error);
      console.error('기사 추천 실패 응답:', error.response);
      console.error('기사 추천 실패 데이터:', error.response?.data);
      const message = error.response?.data?.message || error.message || '기사 추천 중 오류가 발생했습니다.';
      showError('기사 추천 실패', message);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { class: 'bg-warning', text: '⏳ 대기중', icon: 'bi-clock' },
      ASSIGNED: { class: 'bg-info', text: '🚛 배차완료', icon: 'bi-truck' },
      IN_PROGRESS: { class: 'bg-primary', text: '🚚 배송중', icon: 'bi-arrow-right-circle' },
      COMPLETED: { class: 'bg-success', text: '✅ 완료', icon: 'bi-check-circle' },
      CANCELLED: { class: 'bg-danger', text: '❌ 취소', icon: 'bi-x-circle' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return (
      <span className={`badge ${config.class} fs-6 px-3 py-2`}>
        <i className={`bi ${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            {/* 페이지 헤더 */}
            <div className="text-center mb-4">
              <h1 className="display-4 fw-bold text-primary mb-3">🚛 배차 관리</h1>
              <p className="lead text-muted">대기 중인 배송에 기사를 배차합니다</p>
            </div>

            {/* 알림 메시지 */}
            {message && (
              <div className={`alert ${
                message.includes('성공') ? 'alert-success' : 'alert-danger'
              } alert-dismissible fade show`} role="alert">
                <i className={`bi ${message.includes('성공') ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                {message}
                <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
              </div>
            )}

            {/* 배송 목록 */}
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="card-title mb-0">
                  <i className="bi bi-list-ul me-2"></i>
                  배차 대기 목록
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0">
                          <i className="bi bi-geo-alt-fill text-danger me-2"></i>
                          배송지
                        </th>
                        <th className="border-0">
                          <i className="bi bi-calendar-event text-info me-2"></i>
                          배송일
                        </th>
                        <th className="border-0">
                          <i className="bi bi-truck text-warning me-2"></i>
                          사료량
                        </th>
                        <th className="border-0">
                          <i className="bi bi-cash-coin text-success me-2"></i>
                          가격
                        </th>
                        <th className="border-0">
                          <i className="bi bi-flag text-secondary me-2"></i>
                          상태
                        </th>
                        <th className="border-0">
                          <i className="bi bi-person-fill text-primary me-2"></i>
                          배차된 기사
                        </th>
                        <th className="border-0">
                          <i className="bi bi-gear text-dark me-2"></i>
                          관리
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveries.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-4 text-muted">
                            <i className="bi bi-inbox display-4 d-block mb-3"></i>
                            <p className="mb-0">배차 대기 중인 배송이 없습니다.</p>
                          </td>
                        </tr>
                      ) : (
                        deliveries.map((delivery) => (
                          <tr key={delivery.id} className="align-middle">
                            <td>
                              <div>
                                <div className="fw-semibold text-primary">{delivery.destination}</div>
                                <small className="text-muted">{delivery.address}</small>
                              </div>
                            </td>
                            <td>
                              <div className="text-nowrap">
                                {new Date(delivery.deliveryDate).toLocaleDateString()}
                              </div>
                            </td>
                            <td>
                              <div className="text-nowrap">
                                <span className="fw-semibold text-warning">
                                  {delivery.feedTonnage} 톤
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="text-nowrap">
                                <span className="fw-semibold text-success">
                                  {delivery.price?.toLocaleString()}원
                                </span>
                              </div>
                            </td>
                            <td>
                              {getStatusBadge(delivery.status)}
                            </td>
                            <td>
                              {delivery.driver ? (
                                <div className="d-flex align-items-center">
                                  <div className="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2">
                                    <i className="bi bi-person-fill"></i>
                                  </div>
                                  <div>
                                    <div className="fw-semibold">{delivery.driver.name}</div>
                                    <small className="text-muted">{delivery.driver.vehicleNumber}</small>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted">미배차</span>
                              )}
                            </td>
                                                            <td>
                                  {!delivery.driver && delivery.status === 'PENDING' && (
                                    <div className="btn-group btn-group-sm" role="group">
                                      <button
                                        type="button"
                                        className="btn btn-outline-info"
                                        onClick={() => handleRecommend(delivery.id)}
                                        title="기사 추천"
                                      >
                                        <i className="bi bi-lightbulb"></i>
                                      </button>
                                      <div className="dropdown">
                                        <button
                                          className="btn btn-outline-success dropdown-toggle"
                                          type="button"
                                          data-bs-toggle="dropdown"
                                          aria-expanded="false"
                                          title="기사 배차"
                                        >
                                          <i className="bi bi-person-plus"></i>
                                        </button>
                                        <ul className="dropdown-menu">
                                          {drivers.map((driver) => (
                                            <li key={driver.id}>
                                              <button
                                                className="dropdown-item"
                                                onClick={() => handleAssign(delivery.id, driver.id)}
                                                disabled={loading}
                                              >
                                                <i className="bi bi-truck me-2"></i>
                                                {driver.name} ({driver.vehicleNumber})
                                              </button>
                                            </li>
                                          ))}
                                          {drivers.length === 0 && (
                                            <li>
                                              <span className="dropdown-item-text text-muted">
                                                배차 가능한 기사가 없습니다.
                                              </span>
                                            </li>
                                          )}
                                        </ul>
                                      </div>
                                    </div>
                                  )}
                                  {delivery.driver && (delivery.status === 'ASSIGNED' || delivery.status === 'IN_PROGRESS') && (
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleCancelAssignment(delivery.id)}
                                      title="배차 취소"
                                    >
                                      <i className="bi bi-x-circle"></i>
                                    </button>
                                  )}
                                </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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

export default AssignmentsPage;