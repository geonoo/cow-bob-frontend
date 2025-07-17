import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();

  const navigation = [
    { name: '대시보드', href: '/', icon: '📊' },
    { name: '기사 관리', href: '/drivers', icon: '👨‍💼' },
    { name: '배송 관리', href: '/deliveries', icon: '📦' },
    { name: '배차 관리', href: '/assignments', icon: '🚛' },
    { name: '배차된 배송', href: '/assigned-deliveries', icon: '🚚' },
    { name: '직접 배차', href: '/manual-assignment', icon: '🎯' },
    { name: '과거 데이터', href: '/history', icon: '📋' },
    { name: '휴가 관리', href: '/vacations', icon: '🏖️' },
  ];

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* 사이드바 */}
      <nav className="bg-primary text-white" style={{ width: '280px', minHeight: '100vh' }}>
        <div className="p-4 border-bottom border-light">
          <h4 className="mb-0 text-center fw-bold">🚛 물류 배차 시스템</h4>
        </div>
        
        <div className="p-3">
          <ul className="nav nav-pills flex-column">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <li key={item.name} className="nav-item mb-2">
                  <Link
                    href={item.href}
                    className={`nav-link d-flex align-items-center rounded-3 ${
                      isActive 
                        ? 'active bg-light text-primary fw-bold' 
                        : 'text-white-50 hover-bg-light'
                    }`}
                    style={{ 
                      transition: 'all 0.3s ease',
                      padding: '12px 16px'
                    }}
                  >
                    <span className="me-3 fs-5">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <div className="flex-grow-1 bg-light">
        {/* 상단 네비게이션 바 */}
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm border-bottom">
          <div className="container-fluid">
            <button 
              className="navbar-toggler d-lg-none" 
              type="button" 
              data-bs-toggle="offcanvas" 
              data-bs-target="#sidebarOffcanvas"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            
            <div className="navbar-nav ms-auto">
              <div className="nav-item dropdown">
                <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
                  <i className="bi bi-person-circle me-2"></i>
                  관리자
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><a className="dropdown-item" href="#">프로필</a></li>
                  <li><a className="dropdown-item" href="#">설정</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="#">로그아웃</a></li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        {/* 메인 콘텐츠 영역 */}
        <main className="p-4">
          <div className="container-fluid">
            {children}
          </div>
        </main>
      </div>

      {/* 모바일 오프캔버스 사이드바 */}
      <div className="offcanvas offcanvas-start bg-primary text-white" tabIndex={-1} id="sidebarOffcanvas">
        <div className="offcanvas-header border-bottom border-light">
          <h5 className="offcanvas-title text-white fw-bold">🚛 물류 배차 시스템</h5>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
        </div>
        <div className="offcanvas-body p-3">
          <ul className="nav nav-pills flex-column">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <li key={item.name} className="nav-item mb-2">
                  <Link
                    href={item.href}
                    className={`nav-link d-flex align-items-center rounded-3 ${
                      isActive 
                        ? 'active bg-light text-primary fw-bold' 
                        : 'text-white-50'
                    }`}
                    style={{ padding: '12px 16px' }}
                    data-bs-dismiss="offcanvas"
                  >
                    <span className="me-3 fs-5">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Layout;