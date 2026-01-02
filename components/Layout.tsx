import React, { useState } from 'react';
import { 
  Menu, X, Home, LogOut, 
  Plus, Layout as LayoutIcon
} from 'lucide-react';
import { User, Project } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  projects: Project[];
  activeProjectId: string | null;
  onNavigate: (view: 'dashboard' | 'project', id?: string) => void;
  onLogout: () => void;
  onCreateProject: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, user, projects, activeProjectId, onNavigate, onLogout, onCreateProject 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        className={`
          ${isSidebarOpen ? 'w-64' : 'w-20'} 
          bg-emerald-950 text-emerald-100 transition-all duration-300 ease-in-out flex flex-col
          z-20 shadow-xl
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-emerald-900/50">
            {isSidebarOpen && (
                 <div className="flex items-center gap-2 font-bold text-white text-lg tracking-tight">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-emerald-950">
                        <span className="text-lg">🥑</span>
                    </div>
                    <span>Avocado</span>
                 </div>
            )}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-emerald-400 hover:text-white transition">
                <Menu size={20} className={!isSidebarOpen ? "mx-auto" : ""} />
            </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
            <div className="px-4">
                <button 
                    onClick={() => onNavigate('dashboard')}
                    className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                        ${!activeProjectId ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'hover:bg-emerald-900/50 text-emerald-200 hover:text-white'}
                    `}
                    title="Dashboard"
                >
                    <Home size={20} />
                    {isSidebarOpen && <span className="font-medium">Dashboard</span>}
                </button>
            </div>

            <div className="px-4">
                <div className="flex items-center justify-between mb-3 px-2">
                    {isSidebarOpen && <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Projects</span>}
                    {isSidebarOpen && user.role !== 'CLIENT' && (
                        <button onClick={onCreateProject} className="text-emerald-500 hover:text-white transition bg-emerald-900/30 p-1 rounded-md">
                            <Plus size={14} />
                        </button>
                    )}
                </div>

                <div className="space-y-1">
                    {projects.map(project => (
                        <button
                            key={project.id}
                            onClick={() => onNavigate('project', project.id)}
                            className={`
                                w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm
                                ${activeProjectId === project.id ? 'bg-emerald-900 text-white border border-emerald-800' : 'text-emerald-300 hover:bg-emerald-900/30 hover:text-white'}
                            `}
                            title={project.name}
                        >
                            <span className="text-lg opacity-80" role="img" aria-label="icon">{project.icon}</span>
                            {isSidebarOpen && <span className="truncate font-medium">{project.name}</span>}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* User Profile */}
        <div className="p-4 bg-emerald-950 border-t border-emerald-900/50">
            <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'} bg-emerald-900/40 p-2 rounded-xl border border-emerald-900`}>
                <div className="relative">
                    <img src={user.avatar} alt="User" className="w-9 h-9 rounded-full border-2 border-emerald-500/30" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-emerald-900 rounded-full"></div>
                </div>
                {isSidebarOpen && (
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">{user.role}</p>
                    </div>
                )}
                {isSidebarOpen && (
                    <button onClick={onLogout} className="text-emerald-500 hover:text-red-400 transition p-1.5 hover:bg-emerald-900/50 rounded-lg">
                        <LogOut size={16} />
                    </button>
                )}
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-white shrink-0 shadow-sm z-10">
             <div className="flex items-center gap-2 text-slate-400 text-sm">
                <LayoutIcon size={16} />
                <span>/</span>
                <span className="font-semibold text-slate-800 text-base">
                    {activeProjectId 
                        ? projects.find(p => p.id === activeProjectId)?.name 
                        : 'Dashboard'}
                </span>
             </div>
             
             <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                     All Systems Operational
                 </div>
             </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden relative">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;