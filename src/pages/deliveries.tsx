import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ErrorModal from '../components/ErrorModal';
import { deliveryApi, driverApi } from '../services/apiClient';
import { Delivery, Driver } from '../types';

const DeliveriesPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [formData, setFormData] = useState({
    destination: '',
    address: '',
    price: '',
    feedTonnage: '',
    deliveryDate: '',
    driverId: '',
    notes: ''
  });
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
      const response = await deliveryApi.getAll();
      setDeliveries(response.data);
    } catch (error: any) {
      console.error('배송 목록 로딩 실패:', error);
      const message = error.response?.data?.message || '배송 목록을 불러오는데 실패했습니다.';
      showError('배송 목록 로딩 실패', message);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await driverApi.getAll();
      setDrivers(response.data);
    } catch (error: any) {
      console.error('기사 목록 로딩 실패:', error);
      const message = error.response?.data?.message || '기사 목록을 불러오는데 실패했습니다.';
      showError('기사 목록 로딩 실패', message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const deliveryData = {
        ...formData,
        price: parseFloat(formData.price),
        feedTonnage: parseFloat(formData.feedTonnage),
        driver: formData.driverId ? { id: parseInt(formData.driverId) } : null
      };

      await deliveryApi.create(deliveryData);
      setMessage('배송이 성공적으로 등록되었습니다.');
      
      // 폼 초기화
      setFormData({
        destination: '',
        address: '',
        price: '',
        feedTonnage: '',
        deliveryDate: '',
        driverId: '',
        notes: ''
      });
      
      fetchDeliveries();
    } catch (error: any) {
      const message = error.response?.data?.message || '배송 등록 중 오류가 발생했습니다.';
      showError('배송 등록 실패', message);
      console.error('배송 등록 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleComplete = async (id: number) => {
    try {
      await deliveryApi.complete(id);
      setMessage('배송이 완료 처리되었습니다.');
      fetchDeliveries();
    } catch (error: any) {
      const message = error.response?.data?.message || '배송 완료 처리 중 오류가 발생했습니다.';
      showError('배송 완료 실패', message);
      console.error('배송 완료 실패:', error);
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
              <h1 className="display-4 fw-bold text-primary mb-3">🚚 배송 관리</h1>
              <p className="lead text-muted">새로운 배송을 등록하고 관리합니다</p>
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

            <div className="row">
              {/* 배송 등록 폼 */}
              <div className="col-12 col-lg-5 mb-4">
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-primary text-white">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-plus-circle me-2"></i>
                      배송 등록
                    </h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label fw-semibold text-dark">
                            <i className="bi bi-geo-alt-fill text-danger me-2"></i>
                            배송지 <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            name="destination"
                            className="form-control form-control-lg shadow-sm border-2"
                            style={{ 
                              borderColor: '#ffebee',
                              backgroundColor: '#fafafa',
                              transition: 'all 0.3s ease'
                            }}
                            value={formData.destination}
                            onChange={handleChange}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#f44336';
                              e.target.style.backgroundColor = '#ffffff';
                              e.target.style.boxShadow = '0 0 0 0.2rem rgba(244, 67, 54, 0.25)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#ffebee';
                              e.target.style.backgroundColor = '#fafafa';
                              e.target.style.boxShadow = 'none';
                            }}
                            required
                            placeholder="🏭 배송지명을 입력하세요"
                          />
                        </div>

                        <div className="col-12">
                          <label className="form-label fw-semibold text-dark">
                            <i className="bi bi-house-fill text-success me-2"></i>
                            주소 <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            name="address"
                            className="form-control form-control-lg shadow-sm border-2"
                            style={{ 
                              borderColor: '#e8f5e8',
                              backgroundColor: '#fafafa',
                              transition: 'all 0.3s ease'
                            }}
                            value={formData.address}
                            onChange={handleChange}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#4caf50';
                              e.target.style.backgroundColor = '#ffffff';
                              e.target.style.boxShadow = '0 0 0 0.2rem rgba(76, 175, 80, 0.25)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#e8f5e8';
                              e.target.style.backgroundColor = '#fafafa';
                              e.target.style.boxShadow = 'none';
                            }}
                            required
                            placeholder="🏠 상세 주소를 입력하세요"
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-dark">
                            <i className="bi bi-calendar-event-fill text-info me-2"></i>
                            배송일 <span className="text-danger">*</span>
                          </label>
                          <input
                            type="date"
                            name="deliveryDate"
                            className="form-control form-control-lg shadow-sm border-2"
                            style={{ 
                              borderColor: '#e1f5fe',
                              backgroundColor: '#fafafa',
                              transition: 'all 0.3s ease'
                            }}
                            value={formData.deliveryDate}
                            onChange={handleChange}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#00bcd4';
                              e.target.style.backgroundColor = '#ffffff';
                              e.target.style.boxShadow = '0 0 0 0.2rem rgba(0, 188, 212, 0.25)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#e1f5fe';
                              e.target.style.backgroundColor = '#fafafa';
                              e.target.style.boxShadow = 'none';
                            }}
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-dark">
                            <i className="bi bi-person-fill text-primary me-2"></i>
                            담당 기사
                          </label>
                          <select
                            name="driverId"
                            className="form-select form-select-lg shadow-sm border-2"
                            style={{ 
                              borderColor: '#e3f2fd',
                              backgroundColor: '#fafafa',
                              transition: 'all 0.3s ease'
                            }}
                            value={formData.driverId}
                            onChange={handleChange}
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
                            <option value="">👨‍💼 기사를 선택하세요</option>
                            {drivers.map((driver) => (
                              <option key={driver.id} value={driver.id}>
                                🚛 {driver.name} ({driver.vehicleNumber})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-dark">
                            <i className="bi bi-truck text-warning me-2"></i>
                            사료량 <span className="text-danger">*</span>
                          </label>
                          <div className="input-group input-group-lg shadow-sm">
                            <input
                              type="number"
                              name="feedTonnage"
                              className="form-control border-2"
                              style={{ 
                                borderColor: '#fff3e0',
                                backgroundColor: '#fafafa',
                                transition: 'all 0.3s ease'
                              }}
                              value={formData.feedTonnage}
                              onChange={handleChange}
                              onFocus={(e) => {
                                e.target.style.borderColor = '#ff9800';
                                e.target.style.backgroundColor = '#ffffff';
                                e.target.style.boxShadow = '0 0 0 0.2rem rgba(255, 152, 0, 0.25)';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = '#fff3e0';
                                e.target.style.backgroundColor = '#fafafa';
                                e.target.style.boxShadow = 'none';
                              }}
                              required
                              step="0.1"
                              min="0"
                              placeholder="0.0"
                            />
                            <span className="input-group-text bg-light border-2 fw-bold" style={{ borderColor: '#fff3e0' }}>
                              🚛 톤
                            </span>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-dark">
                            <i className="bi bi-cash-coin text-success me-2"></i>
                            가격 <span className="text-danger">*</span>
                          </label>
                          <div className="input-group input-group-lg shadow-sm">
                            <input
                              type="number"
                              name="price"
                              className="form-control border-2"
                              style={{ 
                                borderColor: '#e8f5e8',
                                backgroundColor: '#fafafa',
                                transition: 'all 0.3s ease'
                              }}
                              value={formData.price}
                              onChange={handleChange}
                              onFocus={(e) => {
                                e.target.style.borderColor = '#4caf50';
                                e.target.style.backgroundColor = '#ffffff';
                                e.target.style.boxShadow = '0 0 0 0.2rem rgba(76, 175, 80, 0.25)';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = '#e8f5e8';
                                e.target.style.backgroundColor = '#fafafa';
                                e.target.style.boxShadow = 'none';
                              }}
                              required
                              min="0"
                              placeholder="0"
                            />
                            <span className="input-group-text bg-light border-2 fw-bold" style={{ borderColor: '#e8f5e8' }}>
                              💰 원
                            </span>
                          </div>
                        </div>

                        <div className="col-12">
                          <label className="form-label fw-semibold text-dark">
                            <i className="bi bi-chat-text-fill text-secondary me-2"></i>
                            메모
                          </label>
                          <textarea
                            name="notes"
                            className="form-control form-control-lg shadow-sm border-2"
                            style={{ 
                              borderColor: '#f5f5f5',
                              backgroundColor: '#fafafa',
                              transition: 'all 0.3s ease',
                              resize: 'vertical'
                            }}
                            value={formData.notes}
                            onChange={handleChange}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#6c757d';
                              e.target.style.backgroundColor = '#ffffff';
                              e.target.style.boxShadow = '0 0 0 0.2rem rgba(108, 117, 125, 0.25)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#f5f5f5';
                              e.target.style.backgroundColor = '#fafafa';
                              e.target.style.boxShadow = 'none';
                            }}
                            rows={3}
                            placeholder="📝 추가 메모가 있으면 입력하세요..."
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                  <div className="card-footer bg-light">
                    <div className="d-grid">
                      <button
                        type="submit"
                        className="btn btn-success btn-lg shadow-sm"
                        style={{
                          borderRadius: '25px',
                          background: loading ? '#6c757d' : 'linear-gradient(45deg, #28a745, #20c997)',
                          border: 'none',
                          transition: 'all 0.3s ease'
                        }}
                        disabled={loading}
                        onClick={handleSubmit}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            const target = e.target as HTMLButtonElement;
                            target.style.transform = 'translateY(-2px)';
                            target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
                            target.style.background = 'linear-gradient(45deg, #20c997, #17a2b8)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            const target = e.target as HTMLButtonElement;
                            target.style.transform = 'translateY(0)';
                            target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                            target.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
                          }
                        }}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            ⏳ 등록 중...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-plus-circle-fill me-2"></i>
                            🚚 배송 등록
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 배송 목록 */}
              <div className="col-12 col-lg-7">
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-info text-white">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-list-ul me-2"></i>
                      배송 목록
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
                              담당 기사
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
                                <p className="mb-0">등록된 배송이 없습니다.</p>
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
                                  {delivery.status === 'IN_PROGRESS' && (
                                    <button
                                      type="button"
                                      className="btn btn-outline-success btn-sm"
                                      onClick={() => handleComplete(delivery.id)}
                                      title="배송 완료"
                                    >
                                      <i className="bi bi-check-lg"></i>
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

export default DeliveriesPage;