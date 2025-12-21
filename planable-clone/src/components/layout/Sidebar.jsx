import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  PenSquare,
  FolderOpen,
  Settings,
  Users,
  BarChart3,
  Bell,
  Plus,
  ChevronDown,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: PenSquare, label: 'Compose', path: '/compose' },
  { icon: FolderOpen, label: 'Media Library', path: '/media' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Users, label: 'Team', path: '/team' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const socialAccounts = [
  { name: 'Facebook Page', platform: 'facebook', color: '#1877F2' },
  { name: 'Instagram', platform: 'instagram', color: '#E4405F' },
  { name: 'Twitter / X', platform: 'twitter', color: '#000000' },
  { name: 'LinkedIn', platform: 'linkedin', color: '#0A66C2' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-purple-600 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Planable
        </h1>
      </div>

      {/* Create Button */}
      <div className="p-4">
        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2.5 px-4 flex items-center justify-center gap-2 font-medium transition-colors">
          <Plus className="w-5 h-5" />
          Create Post
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Social Accounts Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Accounts
            </span>
            <button className="text-gray-400 hover:text-gray-600">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <ul className="space-y-1">
            {socialAccounts.map((account) => (
              <li key={account.platform}>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: account.color }}
                  />
                  {account.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-sm font-medium text-purple-600">JD</span>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </aside>
  );
}
