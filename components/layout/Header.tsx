'use client';
import { Bell, Search, ChevronDown } from 'lucide-react';

export function Header({ title }: { title: string }) {
  return (
    <header className="h-16 bg-white border-b border-ava-grey-10 flex items-center justify-between px-8 fixed top-0 right-0 left-60 z-10">
      <div>
        <h1 className="text-lg font-light text-ava-grey-80 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ava-grey-40" />
          <input
            type="text"
            placeholder="Buscar migrações..."
            className="pl-9 pr-4 py-2 text-sm bg-ava-grey-10 border border-transparent rounded-ava-sm
                       focus:outline-none focus:border-ava-orange focus:bg-white transition-all w-56
                       text-ava-grey-80 placeholder-ava-grey-40"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-ava-sm hover:bg-ava-grey-10 transition-colors">
          <Bell size={17} className="text-ava-grey-60" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-ava-orange rounded-full" />
        </button>

        {/* User */}
        <button className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-ava-sm hover:bg-ava-grey-10 transition-colors">
          <div className="w-7 h-7 rounded-full bg-ava-master flex items-center justify-center text-white text-xs font-bold">
            JP
          </div>
          <span className="text-sm font-medium text-ava-grey-80 hidden md:block">Julio Pessan</span>
          <ChevronDown size={14} className="text-ava-grey-40" />
        </button>
      </div>
    </header>
  );
}
