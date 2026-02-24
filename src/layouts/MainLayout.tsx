import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { LogOut, User, Menu } from 'lucide-react';

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Menu className="h-6 w-6 text-gray-500 mr-4" />
              <h1 className="text-xl font-bold text-[#1D4ED8]">피복 구매관리 시스템</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                <User className="h-4 w-4 mr-2" />
                <span className="font-medium">{user?.name}</span>
                <span className="text-gray-500 ml-1">({user?.role})</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-4 w-4 mr-1" />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
