import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ErrorModal from '../components/ErrorModal';
import { driverApi } from '../services/apiClient';
import { Driver } from '../types';
import axios from 'axios';

const DriversPage: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    phoneNumber: string;
    vehicleNumber: string;
    vehicleType: string;
    tonnage: number;
    status: 'ACTIVE' | 'INACTIVE' | 'ON_VACATION';
  }>({
    name: '',
    phoneNumber: '',
    vehicleNumber: '',
    vehicleType: '',
    tonnage: 0,
    status: 'ACTIVE',
  });
  const [revenueModal, setRevenueModal] = useState({ open: false, driver: null as Driver | null, data: [], year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
  const [errorModal, setErrorModal] = useState({ show: false, message: '', title: '' });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const showError = (title: string, message: string) => {
    setErrorModal({ show: true, title, message });
  };

  const fetchDrivers = async () => {
    try {
      const response = await driverApi.getAll();
      setDrivers(response.data);
    } catch (error: any) {
      console.error('기사 목록 로딩 실패:', error);
      const message = error.response?.data?.message || '기사 목록을 불러오는데 실패했습니다.';
      showError('기사 목록 로딩 실패', message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        await driverApi.update(editingDriver.id, formData);
      } else {
        await driverApi.create(formData);
      }
      await fetchDrivers();
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      console.error('기사 저장 실패:', error);
      const message = error.response?.data?.message || '기사 정보 저장에 실패했습니다.';
      showError('기사 저장 실패', message);
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      phoneNumber: driver.phoneNumber,
      vehicleNumber: driver.vehicleNumber,
      vehicleType: driver.vehicleType,
      tonnage: driver.tonnage,
      status: driver.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        await driverApi.delete(id);
        await fetchDrivers();
      } catch (error: any) {
        console.error('기사 삭제 실패:', error);
        const message = error.response?.data?.message || '기사 삭제에 실패했습니다.';
        showError('기사 삭제 실패', message);
      }
    }
  };

  const fetchRevenue = async (driverId: number, year: number, month: number) => {
    try {
      const response = await axios.get(`/api/drivers/${driverId}/revenue?year=${year}&month=${month}`);
      setRevenueModal((prev) => ({ ...prev, data: response.data }));
    } catch (error: any) {
      setRevenueModal((prev) => ({ ...prev, data: [] }));
      const message = error.response?.data?.message || '매출 데이터 조회에 실패했습니다.';
      showError('매출 조회 실패', message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phoneNumber: '',
      vehicleNumber: '',
      vehicleType: '',
      tonnage: 0,
      status: 'ACTIVE',
    });
    setEditingDriver(null);
  };

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
            <h1 className="display-4 fw-bold text-primary mb-3">👨‍💼 기사 관리</h1>
            <button 
              className="btn btn-primary btn-lg rounded-pill px-4"
              onClick={() => setShowModal(true)}
            >
              <i className="bi bi-plus-circle me-2"></i>
              기사 추가
            </button>
          </div>
        </div>

        {/* 데스크톱 테이블 */}
        <div className="row d-none d-md-block">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="card-title mb-0">기사 목록</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="px-4 py-3">이름</th>
                        <th className="px-4 py-3">전화번호</th>
                        <th className="px-4 py-3">차량정보</th>
                        <th className="px-4 py-3">상태</th>
                        <th className="px-4 py-3">가입일</th>
                        <th className="px-4 py-3 text-center">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.map((driver) => (
                        <tr key={driver.id}>
                          <td className="px-4 py-3">
                            <div className="fw-medium">{driver.name}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-muted">{driver.phoneNumber}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="small">
                              <div className="fw-medium">{driver.vehicleNumber}</div>
                              <div className="text-muted">{driver.vehicleType} ({driver.tonnage}톤)</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`badge ${
                              driver.status === 'ACTIVE' ? 'bg-success' :
                              driver.status === 'ON_VACATION' ? 'bg-warning' :
                              'bg-danger'
                            }`}>
                              {driver.status === 'ACTIVE' ? '활성' :
                               driver.status === 'ON_VACATION' ? '휴가' : '비활성'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <small className="text-muted">
                              {new Date(driver.joinDate).toLocaleDateString('ko-KR')}
                            </small>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-outline-primary btn-sm shadow-sm"
                                onClick={() => handleEdit(driver)}
                                title="기사 정보 수정"
                              >
                                <i className="bi bi-pencil me-1"></i>
                                수정
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm shadow-sm"
                                onClick={() => handleDelete(driver.id)}
                                title="기사 삭제"
                              >
                                <i className="bi bi-trash me-1"></i>
                                삭제
                              </button>
                              <button
                                className="btn btn-outline-success btn-sm shadow-sm"
                                onClick={() => {
                                  setRevenueModal({ open: true, driver, data: [], year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
                                  fetchRevenue(driver.id, new Date().getFullYear(), new Date().getMonth() + 1);
                                }}
                                title="월별 매출 보기"
                              >
                                <i className="bi bi-bar-chart me-1"></i>
                                월별 매출
                              </button>
                            </div>
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

        {/* 모바일 카드 뷰 */}
        <div className="row d-md-none">
          <div className="col-12">
            {drivers.map((driver) => (
              <div key={driver.id} className="card mb-3 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="card-title mb-1">{driver.name}</h5>
                      <p className="card-text text-muted small">{driver.phoneNumber}</p>
                    </div>
                    <span className={`badge ${
                      driver.status === 'ACTIVE' ? 'bg-success' :
                      driver.status === 'ON_VACATION' ? 'bg-warning' :
                      'bg-danger'
                    }`}>
                      {driver.status === 'ACTIVE' ? '활성' :
                       driver.status === 'ON_VACATION' ? '휴가' : '비활성'}
                    </span>
                  </div>
                  
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <small className="text-muted">차량번호</small>
                      <div className="fw-medium">{driver.vehicleNumber}</div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">차량정보</small>
                      <div className="fw-medium">{driver.vehicleType} ({driver.tonnage}톤)</div>
                    </div>
                    <div className="col-12">
                      <small className="text-muted">가입일</small>
                      <div className="fw-medium">{new Date(driver.joinDate).toLocaleDateString('ko-KR')}</div>
                    </div>
                  </div>
                  
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleEdit(driver)}
                    >
                      <i className="bi bi-pencil me-1"></i>수정
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(driver.id)}
                    >
                      <i className="bi bi-trash me-1"></i>삭제
                    </button>
                    <button
                      className="btn btn-outline-success btn-sm"
                      onClick={() => {
                        setRevenueModal({ open: true, driver, data: [], year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
                        fetchRevenue(driver.id, new Date().getFullYear(), new Date().getMonth() + 1);
                      }}
                    >
                      <i className="bi bi-bar-chart me-1"></i>월별 매출
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bootstrap 모달 */}
        {showModal && (
          <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingDriver ? '✏️ 기사 수정' : '➕ 기사 추가'}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                      <div className="col-12">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-person-fill text-primary me-2"></i>
                          이름 <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg shadow-sm border-2"
                          style={{ 
                            borderColor: '#e3f2fd',
                            backgroundColor: '#fafafa',
                            transition: 'all 0.3s ease'
                          }}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                          placeholder="기사 이름을 입력하세요"
                        />
                      </div>
                      
                      <div className="col-12">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-telephone-fill text-success me-2"></i>
                          전화번호 <span className="text-danger">*</span>
                        </label>
                        <input
                          type="tel"
                          className="form-control form-control-lg shadow-sm border-2"
                          style={{ 
                            borderColor: '#e8f5e8',
                            backgroundColor: '#fafafa',
                            transition: 'all 0.3s ease'
                          }}
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
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
                          placeholder="010-0000-0000"
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-car-front-fill text-warning me-2"></i>
                          차량번호 <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg shadow-sm border-2"
                          style={{ 
                            borderColor: '#fff3e0',
                            backgroundColor: '#fafafa',
                            transition: 'all 0.3s ease'
                          }}
                          value={formData.vehicleNumber}
                          onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
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
                          placeholder="12가3456"
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-truck text-info me-2"></i>
                          차량종류 <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg shadow-sm border-2"
                          style={{ 
                            borderColor: '#e0f2f1',
                            backgroundColor: '#fafafa',
                            transition: 'all 0.3s ease'
                          }}
                          value={formData.vehicleType}
                          onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
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
                          required
                          placeholder="트럭"
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-speedometer2 text-purple me-2"></i>
                          톤수 <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-group-lg shadow-sm">
                          <input
                            type="number"
                            step="0.1"
                            className="form-control border-2"
                            style={{ 
                              borderColor: '#f3e5f5',
                              backgroundColor: '#fafafa',
                              transition: 'all 0.3s ease'
                            }}
                            value={formData.tonnage}
                            onChange={(e) => setFormData({ ...formData, tonnage: parseFloat(e.target.value) })}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#9c27b0';
                              e.target.style.backgroundColor = '#ffffff';
                              e.target.style.boxShadow = '0 0 0 0.2rem rgba(156, 39, 176, 0.25)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#f3e5f5';
                              e.target.style.backgroundColor = '#fafafa';
                              e.target.style.boxShadow = 'none';
                            }}
                            required
                            placeholder="5.0"
                          />
                          <span className="input-group-text bg-light border-2" style={{ borderColor: '#f3e5f5' }}>
                            <strong>톤</strong>
                          </span>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-toggle-on text-secondary me-2"></i>
                          상태
                        </label>
                        <select
                          className="form-select form-select-lg shadow-sm border-2"
                          style={{ 
                            borderColor: '#f5f5f5',
                            backgroundColor: '#fafafa',
                            transition: 'all 0.3s ease'
                          }}
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
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
                        >
                          <option value="ACTIVE">✅ 활성</option>
                          <option value="INACTIVE">❌ 비활성</option>
                          <option value="ON_VACATION">🏖️ 휴가</option>
                        </select>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-lg px-4 shadow-sm"
                    style={{
                      borderRadius: '25px',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    취소
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-lg px-4 shadow-sm"
                    style={{
                      borderRadius: '25px',
                      background: 'linear-gradient(45deg, #007bff, #0056b3)',
                      border: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={handleSubmit}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(0,123,255,0.4)';
                      e.target.style.background = 'linear-gradient(45deg, #0056b3, #004085)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      e.target.style.background = 'linear-gradient(45deg, #007bff, #0056b3)';
                    }}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    {editingDriver ? '✏️ 수정 완료' : '➕ 기사 추가'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 매출 모달 */}
        {revenueModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{revenueModal.driver?.name} 기사 월별 매출</h3>
                <button onClick={() => setRevenueModal({ ...revenueModal, open: false })} className="text-gray-500 hover:text-gray-700">닫기</button>
              </div>
              <div className="flex gap-2 mb-4">
                <select value={revenueModal.year} onChange={e => {
                  const year = Number(e.target.value);
                  setRevenueModal(prev => ({ ...prev, year }));
                  fetchRevenue(revenueModal.driver.id, year, revenueModal.month);
                }} className="border rounded px-2 py-1">
                  {[2023, 2024].map(y => <option key={y} value={y}>{y}년</option>)}
                </select>
                <select value={revenueModal.month} onChange={e => {
                  const month = Number(e.target.value);
                  setRevenueModal(prev => ({ ...prev, month }));
                  fetchRevenue(revenueModal.driver.id, revenueModal.year, month);
                }} className="border rounded px-2 py-1">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}월</option>)}
                </select>
              </div>
              <div>
                {revenueModal.data.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">매출 데이터가 없습니다.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="border-b py-2">날짜</th>
                        <th className="border-b py-2">매출(원)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueModal.data.map((row: any) => (
                        <tr key={row.date}>
                          <td className="py-1 text-center">{row.date}</td>
                          <td className="py-1 text-right">{row.amount.toLocaleString()}원</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
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

export default DriversPage;