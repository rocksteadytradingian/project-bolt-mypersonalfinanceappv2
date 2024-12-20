import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOutUser } from '../services/auth/authService';
import { Button } from './ui/Button';
import { Logo } from './Logo';

// Icons import from a reliable source like heroicons
import {
  HomeIcon,
  PlusCircleIcon,
  ChartBarIcon,
  CreditCardIcon,
  BanknotesIcon,
  PresentationChartLineIcon,
  DocumentChartBarIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  subItems?: { name: string; path: string }[];
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/',
    icon: HomeIcon,
  },
  {
    name: 'Transactions',
    path: '/transactions',
    icon: PlusCircleIcon,
    subItems: [
      { name: 'Add Transaction', path: '/transactions/new' },
      { name: 'Records', path: '/transactions/records' },
      { name: 'Recurring', path: '/transactions/recurring' },
    ],
  },
  {
    name: 'Budget & Planning',
    path: '/budget',
    icon: ChartBarIcon,
    subItems: [
      { name: 'Budget', path: '/budget/overview' },
      { name: 'Fund Sources', path: '/fund-sources' },
    ],
  },
  {
    name: 'Debt & Credit',
    path: '/debt',
    icon: CreditCardIcon,
    subItems: [
      { name: 'Debt', path: '/debt/overview' },
      { name: 'Credit Cards', path: '/credit-cards' },
      { name: 'Loans', path: '/loans' },
    ],
  },
  {
    name: 'Investments',
    path: '/investments',
    icon: BanknotesIcon,
  },
  {
    name: 'Insights & Reports',
    path: '/insights',
    icon: PresentationChartLineIcon,
    subItems: [
      { name: 'Insights', path: '/insights/overview' },
      { name: 'Reports', path: '/reports' },
    ],
  },
  {
    name: 'Consultant',
    path: '/consultant',
    icon: DocumentChartBarIcon,
  },
];

export function Navigation() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  if (!currentUser) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Navigation */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 bg-white shadow-lg overflow-y-auto">
        <div className="p-4">
          <Link to="/" className="flex items-center mb-8">
            <Logo />
          </Link>
          <div className="space-y-2">
            {navItems.map((item) => (
              <div key={item.name}>
                {item.subItems ? (
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className={`w-full flex items-center justify-between p-2 rounded-md ${
                        openDropdown === item.name
                          ? 'bg-primary text-white'
                          : 'text-neutral-500 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <item.icon className="w-5 h-5 mr-2" />
                        <span>{item.name}</span>
                      </div>
                      <ChevronDownIcon
                        className={`w-4 h-4 transition-transform ${
                          openDropdown === item.name ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openDropdown === item.name && (
                      <div className="pl-8 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`block p-2 rounded-md ${
                              isActive(subItem.path)
                                ? 'bg-primary/10 text-primary'
                                : 'text-neutral-500 hover:bg-neutral-100'
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center p-2 rounded-md ${
                      isActive(item.path)
                        ? 'bg-primary text-white'
                        : 'text-neutral-500 hover:bg-neutral-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-2" />
                    <span>{item.name}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-auto p-4 border-t">
          <Link
            to="/profile"
            className="flex items-center p-2 text-neutral-500 hover:bg-neutral-100 rounded-md mb-2"
          >
            <UserCircleIcon className="w-5 h-5 mr-2" />
            Profile
          </Link>
          <Button
            onClick={handleSignOut}
            variant="secondary"
            className="w-full"
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Top bar for tablet */}
      <div className="hidden md:block lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <div className="flex items-center justify-between px-4 py-2">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-md"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-10">
        <div className="flex justify-around items-center h-16">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center p-2 ${
                isActive(item.path)
                  ? 'text-primary'
                  : 'text-neutral-500'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.name.split(' ')[0]}</span>
            </Link>
          ))}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex flex-col items-center p-2 text-neutral-500"
          >
            <Bars3Icon className="w-6 h-6" />
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile/Tablet Sidebar */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20">
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg overflow-y-auto z-30">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-neutral-500"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {navItems.slice(5).map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center text-neutral-500 hover:text-primary"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-2" />
                  {item.name}
                </Link>
              ))}
              <Link
                to="/profile"
                className="flex items-center text-neutral-500 hover:text-primary"
                onClick={() => setIsSidebarOpen(false)}
              >
                <UserCircleIcon className="w-5 h-5 mr-2" />
                Profile
              </Link>
              <Button
                onClick={handleSignOut}
                variant="secondary"
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
