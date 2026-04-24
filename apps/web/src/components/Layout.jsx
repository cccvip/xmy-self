import { Outlet, NavLink } from 'react-router-dom';

export default function Layout() {
  const navClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-500 text-white'
        : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">宝宝成长记录</h1>
          <nav className="flex gap-1">
            <NavLink to="/" className={navClass}>时间线</NavLink>
            <NavLink to="/gallery" className={navClass}>相册</NavLink>
            <NavLink to="/diary" className={navClass}>写日记</NavLink>
            <NavLink to="/settings" className={navClass}>设置</NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
