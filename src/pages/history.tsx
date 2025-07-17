import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { deliveryApi, driverApi } from '../services/apiClient';
import { Driver, Delivery } from '../types';

const HistoryPage: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [formData, setFormData] = useState({
    destination: '',
    address: '',
    price: '',
    feedTonnage: '',
    deliveryDate: '',
    driverId: '',
    status: 'COMPLETED' as const,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await driverApi.getAll();
        setDrivers(response.data);
      } catch (error) {
        console.error('기사 목록 로딩 실패:', error);
      }
    };
    fetchDrivers();
  }, []);

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
      setMessage('과거 배송 데이터가 성공적으로 등록되었습니다.');
      
      // 폼 초기화
      setFormData({
        destination: '',
        address: '',
        price: '',
        feedTonnage: '',
        deliveryDate: '',
        driverId: '',
        status: 'COMPLETED',
        notes: ''
      });
    } catch (error) {
      setMessage('등록 중 오류가 발생했습니다.');
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

  return (
    <Layout>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            {/* 페이지 헤더 */}
            <div className="text-center mb-4">
              <h1 className="display-4 fw-bold text-primary mb-3">📋 과거 배송 데이터 입력</h1>
              <p className="lead text-muted">완료된 배송 기록을 시스템에 추가합니다</p>
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

            {/* 입력 폼 */}
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="card-title mb-0">
                  <i className="bi bi-plus-circle me-2"></i>
                  배송 데이터 입력
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
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

                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark">
                        <i className="bi bi-person-fill text-primary me-2"></i>
                        담당 기사 <span className="text-danger">*</span>
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
                        required
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
                        <i className="bi bi-check-circle-fill text-info me-2"></i>
                        상태
                      </label>
                      <select
                        name="status"
                        className="form-select form-select-lg shadow-sm border-2"
                        style={{ 
                          borderColor: '#e0f2f1',
                          backgroundColor: '#fafafa',
                          transition: 'all 0.3s ease'
                        }}
                        value={formData.status}
                        onChange={handleChange}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#00bcd4';
                          e.target.style.backgroundColor = '#ffffff';
                          e.target.style.boxShadow = '0 0 0 0.2rem rgba(0, 188, 212, 0.25)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e0f2f1';
                          e.target.style.backgroundColor = '#fafafa';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="COMPLETED">✅ 완료</option>
                        <option value="CANCELLED">❌ 취소</option>
                      </select>
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
                        rows={4}
                        placeholder="📝 추가 메모가 있으면 입력하세요..."
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="card-footer bg-light">
                <div className="d-flex flex-column flex-md-row gap-3 justify-content-center align-items-center">
                  <button
                    type="submit"
                    className="btn btn-success btn-lg px-5 shadow-sm"
                    style={{
                      borderRadius: '25px',
                      background: loading ? '#6c757d' : 'linear-gradient(45deg, #28a745, #20c997)',
                      border: 'none',
                      transition: 'all 0.3s ease',
                      minWidth: '200px'
                    }}
                    disabled={loading}
                    onClick={handleSubmit}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
                        e.target.style.background = 'linear-gradient(45deg, #20c997, #17a2b8)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                        e.target.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
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
                        <i className="bi bi-cloud-upload-fill me-2"></i>
                        📋 배송 데이터 등록
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-warning btn-lg px-4 shadow-sm"
                    style={{
                      borderRadius: '25px',
                      transition: 'all 0.3s ease',
                      borderWidth: '2px'
                    }}
                    onClick={() => setFormData({
                      destination: '',
                      address: '',
                      price: '',
                      feedTonnage: '',
                      deliveryDate: '',
                      driverId: '',
                      status: 'COMPLETED',
                      notes: ''
                    })}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(255, 193, 7, 0.3)';
                      e.target.style.backgroundColor = '#ffc107';
                      e.target.style.color = '#000';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#ffc107';
                    }}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    🔄 초기화
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HistoryPage;