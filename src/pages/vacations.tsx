import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ErrorModal from '../components/ErrorModal';
import { vacationApi, driverApi } from '../services/apiClient';
import { Vacation, Driver } from '../types';

const VacationsPage: React.FC = () => {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [formData, setFormData] = useState({
    driverId: '',
    startDate: '',
    endDate: '',
    reason: '',
    status: 'PENDING' as const
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorModal, setErrorModal] = useState({ show: false, title: '', message: '' });

  const showError = (title: string, message: string) => {
    setErrorModal({ show: true, title, message });
  };

  useEffect(() => {
    fetchVacations();
    fetchDrivers();
  }, []);

  const fetchVacations = async () => {
    try {
      const response = await vacationApi.getAll();
      setVacations(response.data);
    } catch (error: any) {
      console.error('휴가 목록 로딩 실패:', error);
      const message = error.response?.data?.message || '휴가 목록을 불러오는데 실패했습니다.';
      showError('휴가 목록 로딩 실패', message);
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
      const vacationData = {
        ...formData,
        driver: { id: parseInt(formData.driverId) }
      };

      await vacationApi.create(vacationData);
      setMessage('휴가 신청이 성공적으로 등록되었습니다.');
      
      // 폼 초기화
      setFormData({
        driverId: '',
        startDate: '',
        endDate: '',
        reason: '',
        status: 'PENDING'
      });
      
      fetchVacations();
    } catch (error: any) {
      const message = error.response?.data?.message || '휴가 신청 중 오류가 발생했습니다.';
      showError('휴가 신청 실패', message);
      console.error('휴가 신청 실패:', error);
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

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      if (status === 'APPROVED') {
        await vacationApi.approve(id);
      } else if (status === 'REJECTED') {
        await vacationApi.reject(id);
      }
      setMessage('휴가 상태가 성공적으로 업데이트되었습니다.');
      fetchVacations();
    } catch (error: any) {
      const message = error.response?.data?.message || '상태 업데이트 중 오류가 발생했습니다.';
      showError('상태 업데이트 실패', message);
      console.error('상태 업데이트 실패:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { class: 'bg-warning', text: '⏳ 대기중', icon: 'bi-clock' },
      APPROVED: { class: 'bg-success', text: '✅ 승인', icon: 'bi-check-circle' },
      REJECTED: { class: 'bg-danger', text: '❌ 거절', icon: 'bi-x-circle' }
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
              <h1 className="display-4 fw-bold text-primary mb-3">🏖️ 휴가 신청 관리</h1>
              <p className="lead text-muted">기사들의 휴가 신청을 관리하고 승인합니다</p>
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
              {/* 휴가 신청 폼 */}
              <div className="col-12 col-lg-5 mb-4">
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-primary text-white">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-plus-circle me-2"></i>
                      휴가 신청
                    </h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label fw-semibold text-dark">
                            <i className="bi bi-person-fill text-primary me-2"></i>
                            기사 선택 <span className="text-danger">*</span>
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
                            <i className="bi bi-calendar-event-fill text-info me-2"></i>
                            시작일 <span className="text-danger">*</span>
                          </label>
                          <input
                            type="date"
                            name="startDate"
                            className="form-control form-control-lg shadow-sm border-2"
                            style={{ 
                              borderColor: '#e1f5fe',
                              backgroundColor: '#fafafa',
                              transition: 'all 0.3s ease'
                            }}
                            value={formData.startDate}
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
                            <i className="bi bi-calendar-check-fill text-success me-2"></i>
                            종료일 <span className="text-danger">*</span>
                          </label>
                          <input
                            type="date"
                            name="endDate"
                            className="form-control form-control-lg shadow-sm border-2"
                            style={{ 
                              borderColor: '#e8f5e8',
                              backgroundColor: '#fafafa',
                              transition: 'all 0.3s ease'
                            }}
                            value={formData.endDate}
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
                          />
                        </div>

                        <div className="col-12">
                          <label className="form-label fw-semibold text-dark">
                            <i className="bi bi-chat-text-fill text-secondary me-2"></i>
                            휴가 사유 <span className="text-danger">*</span>
                          </label>
                          <textarea
                            name="reason"
                            className="form-control form-control-lg shadow-sm border-2"
                            style={{ 
                              borderColor: '#f5f5f5',
                              backgroundColor: '#fafafa',
                              transition: 'all 0.3s ease',
                              resize: 'vertical'
                            }}
                            value={formData.reason}
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
                            required
                            placeholder="📝 휴가 사유를 입력하세요..."
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
                            ⏳ 신청 중...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send-fill me-2"></i>
                            🏖️ 휴가 신청
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 휴가 목록 */}
              <div className="col-12 col-lg-7">
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-info text-white">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-list-ul me-2"></i>
                      휴가 신청 목록
                    </h5>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="border-0">
                              <i className="bi bi-person-fill text-primary me-2"></i>
                              기사
                            </th>
                            <th className="border-0">
                              <i className="bi bi-calendar-range text-info me-2"></i>
                              기간
                            </th>
                            <th className="border-0">
                              <i className="bi bi-chat-text text-secondary me-2"></i>
                              사유
                            </th>
                            <th className="border-0">
                              <i className="bi bi-flag text-warning me-2"></i>
                              상태
                            </th>
                            <th className="border-0">
                              <i className="bi bi-gear text-dark me-2"></i>
                              관리
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {vacations.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center py-4 text-muted">
                                <i className="bi bi-inbox display-4 d-block mb-3"></i>
                                <p className="mb-0">등록된 휴가 신청이 없습니다.</p>
                              </td>
                            </tr>
                          ) : (
                            vacations.map((vacation) => (
                              <tr key={vacation.id} className="align-middle">
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                                      <i className="bi bi-person-fill"></i>
                                    </div>
                                    <div>
                                      <div className="fw-semibold">{vacation.driver?.name}</div>
                                      <small className="text-muted">{vacation.driver?.vehicleNumber}</small>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="text-nowrap">
                                    <div className="fw-semibold text-primary">
                                      {new Date(vacation.startDate).toLocaleDateString()}
                                    </div>
                                    <div className="text-muted">
                                      ~ {new Date(vacation.endDate).toLocaleDateString()}
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="text-truncate" style={{ maxWidth: '150px' }} title={vacation.reason}>
                                    {vacation.reason}
                                  </div>
                                </td>
                                <td>
                                  {getStatusBadge(vacation.status)}
                                </td>
                                <td>
                                  {vacation.status === 'PENDING' && (
                                    <div className="btn-group btn-group-sm" role="group">
                                      <button
                                        type="button"
                                        className="btn btn-outline-success"
                                        onClick={() => handleStatusUpdate(vacation.id, 'APPROVED')}
                                        title="승인"
                                      >
                                        <i className="bi bi-check-lg"></i>
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-outline-danger"
                                        onClick={() => handleStatusUpdate(vacation.id, 'REJECTED')}
                                        title="거절"
                                      >
                                        <i className="bi bi-x-lg"></i>
                                      </button>
                                    </div>
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

export default VacationsPage;