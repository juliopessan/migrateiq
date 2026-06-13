'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard, ArrowRightLeft, Database, Settings,
  Zap, BarChart3, CreditCard, HelpCircle, LogOut,
} from 'lucide-react';

const nav = [
  { href: '/app/dashboard',   icon: LayoutDashboard, label: 'Dashboard'    },
  { href: '/app/migrations',  icon: ArrowRightLeft,  label: 'Migrações'    },
  { href: '/app/connections', icon: Database,         label: 'Conexões'     },
  { href: '/app/monitor',     icon: BarChart3,        label: 'Monitor'      },
  { href: '/app/settings',    icon: Settings,         label: 'Configurações'},
];

const bottom = [
  { href: '/app/billing',  icon: CreditCard,  label: 'Faturamento' },
  { href: '/app/help',     icon: HelpCircle,  label: 'Suporte'     },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-ava-grey-80 flex flex-col z-20">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-ava-sm bg-ava-master flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">MigrateIQ</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-ava-sm text-sm font-medium transition-all',
                active
                  ? 'bg-ava-orange text-white'
                  : 'text-ava-grey-30 hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="py-4 px-3 border-t border-white/10 space-y-0.5">
        {bottom.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-ava-sm text-sm text-ava-grey-40 hover:bg-white/5 hover:text-white transition-all"
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-ava-sm text-sm text-ava-grey-40 hover:bg-red-900/20 hover:text-red-400 transition-all">
          <LogOut size={17} />
          Sair
        </button>
      </div>

      {/* Plan badge */}
      <div className="mx-3 mb-4 p-3 rounded-ava-sm bg-ava-master/20 border border-ava-orange/30">
        <p className="text-[10px] font-bold text-ava-luminous uppercase tracking-wider mb-0.5">Plano Pro</p>
        <p className="text-[11px] text-ava-grey-30">38.2M / 50M linhas</p>
        <div className="mt-2 h-1 bg-white/10 rounded-full">
          <div className="h-1 rounded-full bg-ava-master" style={{ width: '76%' }} />
        </div>
      </div>
    </aside>
  );
}
