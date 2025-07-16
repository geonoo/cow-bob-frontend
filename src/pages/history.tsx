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
                      <label className="form-label">
                        <i className="bi bi-geo-alt me-1"></i>
                        배송지 *
                      </label>
                      <input
                        type="text"
                        name="destination"
                        className="form-control"
                        value={formData.destination}
                        onChange={handleChange}
                        required
                        placeholder="배송지명을 입력하세요"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        <i className="bi bi-calendar me-1"></i>
                        배송일 *
                      </label>
                      <input
                        type="date"
                        name="deliveryDate"
                        className="form-control"
                        value={formData.deliveryDate}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">
                        <i className="bi bi-house me-1"></i>
                        주소 *
                      </label>
                      <input
                        type="text"
                        name="address"
                        className="form-control"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        placeholder="상세 주소를 입력하세요"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        <i className="bi bi-truck me-1"></i>
                        사료량 (톤) *
                      </label>
                      <div className="input-group">
                        <input
                          type="number"
                          name="feedTonnage"
                          className="form-control"
                          value={formData.feedTonnage}
                          onChange={handleChange}
                          required
                          step="0.1"
                          min="0"
                          placeholder="0.0"
                        />
                        <span className="input-group-text">톤</span>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        <i className="bi bi-currency-dollar me-1"></i>
                        가격 (원) *
                      </label>
                      <div className="input-group">
                        <input
                          type="number"
                          name="price"
                          className="form-control"
                          value={formData.price}
                          onChange={handleChange}
                          required
                          min="0"
                          placeholder="0"
                        />
                        <span className="input-group-text">원</span>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        <i className="bi bi-person me-1"></i>
                        담당 기사 *
                      </label>
                      <select
                        name="driverId"
                        className="form-select"
                        value={formData.driverId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">기사를 선택하세요</option>
                        {drivers.map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.name} ({driver.vehicleNumber})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        <i className="bi bi-check-circle me-1"></i>
                        상태
                      </label>
                      <select
                        name="status"
                        className="form-select"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="COMPLETED">완료</option>
                        <option value="CANCELLED">취소</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label">
                        <i className="bi bi-chat-text me-1"></i>
                        메모
                      </label>
                      <textarea
                        name="notes"
                        className="form-control"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        placeholder="추가 메모가 있으면 입력하세요"
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="card-footer bg-light">
                <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                    onClick={handleSubmit}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        등록 중...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        배송 데이터 등록
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
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
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    초기화
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