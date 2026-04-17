"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  MapPin, 
  Receipt, 
  CreditCard, 
  Settings, 
  BarChart3, 
  UserCheck, 
  Shield,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  BellDot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SidebarItem {
  title: string;
  href?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Quản lý người dùng",
    icon: Users,
    children: [
      { title: "Khách hàng", href: "/admin/account/customers", icon: Users },
      { title: "Chủ bãi đỗ", href: "/admin/account/owners", icon: UserCheck },
      { title: "Phê duyệt", href: "/admin/account/approvals", icon: Users, badge: "3" },
    ]
  },
  {
    title: "Quản lý bãi đỗ",
    icon: MapPin,
    href: "/admin/parking/parking-lots"
  },
  {
    title: "Thanh toán",
    icon: CreditCard,
    children: [
      { title: "Giao dịch", href: "/admin/payment/transactions", icon: CreditCard },
      { title: "Hoàn tiền", href: "/admin/payment/refunds", icon: CreditCard, badge: "2" },
    ]
  },
  {
    title: "Báo cáo thống kê",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    title: "Thông Báo",
    href: "/admin/notifications",
    icon: BellDot,
  },
  {
    title: "Cài đặt",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface AdminSidebarProps {
  className?: string;
}

export default function AdminSidebar({ className = "" }: AdminSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };


  // Returns true if the current path matches the item's href exactly
  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href;
  };

  // Returns true if any child of the item is active
  const isChildActive = (item: SidebarItem): boolean => {
    if (!item.children) return false;
    return item.children.some(child =>
      isActive(child.href) || isChildActive(child)
    );
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const Icon = item.icon;

    // Determine if this item or any of its children is active
    const active = isActive(item.href);
    const childActive = isChildActive(item);

    if (hasChildren) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleExpanded(item.title)}
            className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-xl transition-all duration-200 group
              ${active || childActive ? (!isCollapsed ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm shadow-blue-500/5' : '') : 'hover:bg-gray-50'}
              ${level > 0 ? 'ml-4 text-sm' : ''}`}
          >
            <div className="flex items-center gap-2.5">
              {isCollapsed && (active || childActive) ? (
                <span className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mx-auto shadow-md shadow-blue-500/25">
                  <Icon className="w-5 h-5 text-white" />
                </span>
              ) : (
                <span className="flex items-center justify-center w-10 h-10 mx-auto">
                  <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-[18px] h-[18px]'} ${active || childActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} transition-colors`} />
                </span>
              )}
              {!isCollapsed && (
                <span className={`text-[13px] font-medium ${active || childActive ? 'text-blue-700' : 'text-gray-600 group-hover:text-gray-800'} transition-colors`}>
                  {item.title}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                {item.badge && (
                  <Badge variant="secondary" className="bg-red-500 text-white text-[10px] px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center rounded-full font-semibold">
                    {item.badge}
                  </Badge>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-gray-300 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
              </div>
            )}
          </button>

          {isExpanded && !isCollapsed && (
            <div className="mt-0.5 space-y-0.5 ml-5 pl-3 border-l-2 border-gray-100">
              {item.children?.map(child => renderSidebarItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.title}
        href={item.href || '#'}
        className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 group
          ${active ? (!isCollapsed ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm shadow-blue-500/5' : '') : 'hover:bg-gray-50'}
          ${level > 0 ? 'text-sm' : ''}`}
      >
        <div className="flex items-center gap-2.5">
          {isCollapsed && active ? (
            <span className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mx-auto shadow-md shadow-blue-500/25">
              <Icon className="w-5 h-5 text-white" />
            </span>
          ) : (
            <span className="flex items-center justify-center w-10 h-10 mx-auto">
              <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-[18px] h-[18px]'} ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} transition-colors`} />
            </span>
          )}
          {!isCollapsed && (
            <span className={`text-[13px] font-medium ${active ? 'text-blue-700' : 'text-gray-600 group-hover:text-gray-800'} transition-colors`}>
              {item.title}
            </span>
          )}
        </div>
        {!isCollapsed && item.badge && (
          <Badge variant="secondary" className="bg-red-500 text-white text-[10px] px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center rounded-full font-semibold">
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 z-50 bg-white border-r border-gray-100 shadow-[2px_0_12px_rgba(0,0,0,0.04)] transition-all duration-300 lg:sticky lg:top-0 lg:translate-x-0
        ${isCollapsed ? 'w-[68px] min-w-[68px]' : 'w-[272px]'}
        h-screen flex flex-col
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${className}
      `}>
        
        {/* Header */}
        <div className={`p-4 border-b border-gray-100 ${isCollapsed ? 'px-3' : ''}`}>
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden">
                  <img src="/logo.png" alt="GoPark Logo" className="w-9 h-9 object-contain" />
                </div>
                <div>
                  <h1 className="font-bold text-[15px] text-gray-900 tracking-tight">GoPark Admin</h1>
                  <p className="text-[11px] text-gray-400 font-medium">Quản lý hệ thống</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex w-8 h-8 p-0 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Admin Info */}
        {!isCollapsed && (
          <div className="px-4 py-3.5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/20">
                <span className="text-white text-xs font-bold">AD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-800 truncate">Admin User</p>
                <p className="text-[11px] text-gray-400 truncate">admin@gopark.com</p>
              </div>
              <button className="relative p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-4 h-4 text-gray-400" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></div>
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent ${isCollapsed ? 'flex flex-col items-center pt-4' : 'px-3 py-3'}`}>
          <div className={`${isCollapsed ? 'flex flex-col gap-1.5 items-center' : 'space-y-0.5'}`}>
            {sidebarItems.map(item => renderSidebarItem(item))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 mt-auto">
          {!isCollapsed ? (
            <div className="space-y-1">
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-400 rounded-lg hover:bg-gray-50 hover:text-gray-600 transition-colors">
                <Search className="w-4 h-4" />
                <span className="text-[13px]">Tìm kiếm nhanh</span>
              </button>
              <button 
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("role");
                  window.location.href = "/account/login";
                }}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[13px] font-medium">Đăng xuất</span>
              </button>
            </div>
          ) : (
            <button 
              className="w-full flex items-center justify-center p-2 text-red-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                window.location.href = "/account/login";
              }}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}