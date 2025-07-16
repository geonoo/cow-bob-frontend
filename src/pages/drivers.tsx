import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { driverApi } from '../services/apiClient';
import { Driver } from '../types';

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

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await driverApi.getAll();
      setDrivers(response.data);
    } catch (error) {
      console.error('기사 목록 로딩 실패:', error);
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
    } catch (error) {
      console.error('기사 저장 실패:', error);
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
      } catch (error) {
        console.error('기사 삭제 실패:', error);
      }
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
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleEdit(driver)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDelete(driver.id)}
                              >
                                <i className="bi bi-trash"></i>
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
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label">이름 *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          placeholder="기사 이름을 입력하세요"
                        />
                      </div>
                      
                      <div className="col-12">
                        <label className="form-label">전화번호 *</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          required
                          placeholder="010-0000-0000"
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label">차량번호 *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.vehicleNumber}
                          onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                          required
                          placeholder="12가3456"
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label">차량종류 *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.vehicleType}
                          onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                          required
                          placeholder="트럭"
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label">톤수 *</label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-control"
                          value={formData.tonnage}
                          onChange={(e) => setFormData({ ...formData, tonnage: parseFloat(e.target.value) })}
                          required
                          placeholder="5.0"
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label">상태</label>
                        <select
                          className="form-select"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        >
                          <option value="ACTIVE">활성</option>
                          <option value="INACTIVE">비활성</option>
                          <option value="ON_VACATION">휴가</option>
                        </select>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  >
                    <i className="bi bi-x-circle me-1"></i>취소
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSubmit}
                  >
                    <i className="bi bi-check-circle me-1"></i>
                    {editingDriver ? '수정' : '추가'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DriversPage;