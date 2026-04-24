import { Outlet, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserStore } from '../stores/userStore';
import { Toaster } from 'sonner';

const PRESET_RELATIVES = ['爸爸', '妈妈', '爷爷', '奶奶', '外公', '外婆'];

export default function Layout() {
  const { currentUser, setCurrentUser } = useUserStore();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">宝宝成长记录</h1>
          <div className="flex items-center gap-2">
            <Select value={currentUser} onValueChange={setCurrentUser}>
              <SelectTrigger className="w-[100px] h-8 text-sm">
                <SelectValue placeholder="选择操作人" />
              </SelectTrigger>
              <SelectContent>
                {PRESET_RELATIVES.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <nav className="flex gap-1">
            <NavLink to="/">
              {({ isActive }) => (
                <Button variant={isActive ? 'default' : 'ghost'} size="sm">
                  时间线
                </Button>
              )}
            </NavLink>
            <NavLink to="/gallery">
              {({ isActive }) => (
                <Button variant={isActive ? 'default' : 'ghost'} size="sm">
                  相册
                </Button>
              )}
            </NavLink>
            <NavLink to="/diary">
              {({ isActive }) => (
                <Button variant={isActive ? 'default' : 'ghost'} size="sm">
                  写日记
                </Button>
              )}
            </NavLink>
            <NavLink to="/settings">
              {({ isActive }) => (
                <Button variant={isActive ? 'default' : 'ghost'} size="sm">
                  设置
                </Button>
              )}
            </NavLink>
          </nav>
        </div>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
      <Toaster position="top-center" />
    </div>
  );
}
