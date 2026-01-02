import React, { useEffect, useState } from 'react';
import { 
  User, Project, Task, TaskStatus, TaskPriority, UserRole 
} from './types';
import * as db from './services/mockBackend';
import * as aiService from './services/geminiService';
import Layout from './components/Layout';
import TaskBoard from './components/TaskBoard';
import TaskList from './components/TaskList';
import { 
  Sparkles, Plus, LayoutGrid, List as ListIcon, 
  Loader2, X, Lock
} from 'lucide-react';
import { HashRouter } from 'react-router-dom';

// --- Authentication View ---
const AuthView = ({ onLogin }: { onLogin: (email: string) => void }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!email) return;
        setIsLoading(true);
        await onLogin(email);
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl border border-emerald-900/10">
                <div className="text-center mb-10">
                    <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                        <span className="text-3xl">🥑</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Avocado Manager</h1>
                    <p className="text-slate-500 mt-3 text-lg leading-relaxed">Simple, fresh project management.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Work Email</label>
                        <input 
                            type="email" 
                            className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button 
                        disabled={isLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-600/20 flex items-center justify-center gap-2 text-lg"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                    </button>
                </form>
                
                <div className="mt-8 pt-6 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase text-center mb-4">Demo Credentials</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition" onClick={() => setEmail('admin@avocado.com')}>
                            <div className="font-bold text-slate-700 text-sm">Admin</div>
                            <div className="text-xs text-slate-400">Full Access</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition" onClick={() => setEmail('client@avocado.com')}>
                            <div className="font-bold text-slate-700 text-sm">Client</div>
                            <div className="text-xs text-slate-400">Read & Add Only</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Dashboard View ---
const Dashboard = ({ projects, user }: { projects: Project[], user: User }) => {
    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {user.name}</h1>
                    <p className="text-slate-500 text-lg">You are logged in as <span className="font-bold text-emerald-600 uppercase text-xs tracking-wider px-2 py-1 bg-emerald-100 rounded-md">{user.role}</span></p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Projects</h3>
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><LayoutGrid size={18} /></div>
                    </div>
                    <p className="text-4xl font-bold text-slate-800">{projects.length}</p>
                </div>
                
                <div className="md:col-span-2 bg-gradient-to-r from-emerald-500 to-teal-600 p-8 rounded-2xl shadow-xl shadow-emerald-900/10 text-white relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                    <div className="relative z-10">
                         <h3 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Sparkles size={16} />
                            AI Assistant
                        </h3>
                        <p className="font-medium text-xl leading-relaxed max-w-lg">
                            "Avocado AI" can now break down your goals into actionable tasks. Try it inside any project!
                        </p>
                    </div>
                </div>
            </div>
            
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                Recently Accessed
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(p => (
                    <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 cursor-pointer group">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-3xl bg-slate-50 w-12 h-12 flex items-center justify-center rounded-xl group-hover:bg-emerald-50 transition-colors">{p.icon}</span>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg group-hover:text-emerald-700 transition-colors">{p.name}</h3>
                                <p className="text-xs text-slate-400 font-medium">Updated just now</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{p.description}</p>
                    </div>
                ))}
                {projects.length === 0 && (
                    <div className="col-span-3 p-16 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 bg-slate-50/50">
                        <p className="font-medium">No projects yet. Start something fresh!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main App Logic ---

const AppContent = ({ user, setUser }: { user: User, setUser: (u: User | null) => void }) => {
    const [view, setView] = useState<'dashboard' | 'project'>('dashboard');
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
    
    // UI States
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isAIGenerating, setIsAIGenerating] = useState(false);
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    
    // Form States
    const [newProjectName, setNewProjectName] = useState('');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [aiGoal, setAiGoal] = useState('');

    useEffect(() => {
        loadProjects();
    }, [user.id]);

    useEffect(() => {
        if (activeProjectId) {
            loadTasks(activeProjectId);
            setAiSummary(null);
        }
    }, [activeProjectId]);

    const loadProjects = async () => {
        const data = await db.getProjects(user.id);
        setProjects(data);
    };

    const loadTasks = async (projectId: string) => {
        const data = await db.getTasks(projectId);
        setTasks(data);
    };

    const handleCreateProject = async () => {
        // Only admins can create projects
        if (user.role === 'CLIENT') return;

        if (!newProjectName) return;
        const p = await db.createProject({
            ownerId: user.id,
            name: newProjectName,
            description: 'New Project',
            icon: '🥑',
            color: 'green'
        });
        setProjects([...projects, p]);
        setNewProjectName('');
        setIsProjectModalOpen(false);
        setActiveProjectId(p.id);
        setView('project');
    };

    const handleCreateTask = async () => {
        if (!newTaskTitle || !activeProjectId) return;
        const t = await db.createTask({
            projectId: activeProjectId,
            title: newTaskTitle,
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM
        });
        setTasks([...tasks, t]);
        setNewTaskTitle('');
        setIsTaskModalOpen(false);
    };

    const handleAIGenerate = async () => {
        if (!aiGoal || !activeProjectId) return;
        setIsAIGenerating(true);
        const newTasks = await aiService.generateTasksFromGoal(activeProjectId, aiGoal);
        
        // Save generated tasks to DB
        const savedTasks = await Promise.all(newTasks.map(t => db.createTask(t)));
        
        setTasks([...tasks, ...savedTasks]);
        setIsAIGenerating(false);
        setIsTaskModalOpen(false);
        setAiGoal('');
    };

    const handleGenerateSummary = async () => {
        if(!activeProjectId) return;
        setIsAIGenerating(true);
        const summary = await aiService.summarizeProject(tasks);
        setAiSummary(summary);
        setIsAIGenerating(false);
    }

    const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
        // Clients cannot move tasks
        if (user.role === 'CLIENT') return;

        // Optimistic update
        const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status } : t);
        setTasks(updatedTasks);
        await db.updateTask(taskId, { status });
    };

    return (
        <Layout 
            user={user} 
            projects={projects}
            activeProjectId={activeProjectId}
            onNavigate={(v, id) => {
                setView(v);
                if (id) setActiveProjectId(id);
                else setActiveProjectId(null);
            }}
            onLogout={() => {
                db.logoutUser();
                setUser(null);
            }}
            onCreateProject={() => {
                if(user.role !== 'CLIENT') setIsProjectModalOpen(true)
            }}
        >
            {view === 'dashboard' && <Dashboard projects={projects} user={user} />}
            
            {view === 'project' && activeProjectId && (
                <div className="flex flex-col h-full">
                    {/* Project Toolbar */}
                    <div className="h-16 border-b border-slate-100 px-8 flex items-center justify-between bg-white shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="flex bg-slate-100/80 p-1 rounded-xl">
                                <button 
                                    onClick={() => setViewMode('list')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <ListIcon size={16} /> List
                                </button>
                                <button 
                                    onClick={() => setViewMode('board')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${viewMode === 'board' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <LayoutGrid size={16} /> Board
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3">
                             <button 
                                onClick={handleGenerateSummary}
                                disabled={isAIGenerating}
                                className="px-4 py-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-sm font-bold transition flex items-center gap-2 border border-emerald-100"
                             >
                                <Sparkles size={16} />
                                {isAIGenerating && !aiGoal ? 'Thinking...' : 'AI Summary'}
                             </button>
                            <button 
                                onClick={() => setIsTaskModalOpen(true)}
                                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-slate-900/20"
                            >
                                <Plus size={18} /> New Task
                            </button>
                        </div>
                    </div>

                    {/* AI Summary Banner */}
                    {aiSummary && (
                         <div className="mx-8 mt-6 p-5 bg-white border border-emerald-100 rounded-2xl relative shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                             <button onClick={() => setAiSummary(null)} className="absolute top-3 right-3 text-slate-300 hover:text-slate-500"><X size={18}/></button>
                             <div className="flex gap-4">
                                <div className="p-3 bg-emerald-50 rounded-xl h-fit">
                                    <Sparkles className="text-emerald-600" size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 mb-1.5 uppercase tracking-wide">Project Status</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">{aiSummary}</p>
                                </div>
                             </div>
                         </div>
                    )}

                    {/* View Area */}
                    <div className="flex-1 min-h-0 bg-slate-50">
                        {user.role === 'CLIENT' && (
                            <div className="px-8 py-2 bg-amber-50 border-b border-amber-100 text-amber-700 text-xs font-medium flex items-center gap-2 justify-center">
                                <Lock size={12}/> View Only Mode: You can create tasks, but cannot change statuses.
                            </div>
                        )}
                        {viewMode === 'board' 
                            ? <TaskBoard tasks={tasks} userRole={user.role} onUpdateStatus={updateTaskStatus} onEditTask={() => {}} />
                            : <TaskList tasks={tasks} userRole={user.role} onUpdateStatus={updateTaskStatus} onEditTask={() => {}} />
                        }
                    </div>
                </div>
            )}

            {/* Create Project Modal */}
            {isProjectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200 border border-white/20">
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">New Project</h2>
                        <input 
                            autoFocus
                            className="w-full border border-slate-200 rounded-xl px-5 py-4 mb-6 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-lg bg-slate-50"
                            placeholder="Project Name..."
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsProjectModalOpen(false)} className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition">Cancel</button>
                            <button onClick={handleCreateProject} className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-600/20 transition">Create Project</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Task / AI Modal */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-800">Add Task</h2>
                            <button onClick={() => setIsTaskModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition"><X className="text-slate-400" /></button>
                        </div>

                        <div className="space-y-8">
                            {/* Manual Entry */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Add</label>
                                <div className="flex gap-3">
                                    <input 
                                        className="flex-1 border border-slate-200 bg-slate-50 rounded-xl px-5 py-3 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
                                        placeholder="What needs to be done?"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
                                    />
                                    <button onClick={handleCreateTask} className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold shadow-lg">Add</button>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-100"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                                    <span className="bg-white px-4 text-slate-300 font-bold">AI Assistant</span>
                                </div>
                            </div>

                            {/* AI Entry */}
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100/50">
                                <div className="flex items-center gap-2 mb-3 text-emerald-700 font-bold">
                                    <Sparkles size={18} />
                                    <span>Smart Breakdown</span>
                                </div>
                                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                                    Describe a larger goal, and let Avocado AI break it down into manageable steps for you.
                                </p>
                                <textarea 
                                    className="w-full border border-emerald-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-sm min-h-[100px] bg-white/50 backdrop-blur-sm"
                                    placeholder="e.g. Launch a marketing campaign for the new summer collection..."
                                    value={aiGoal}
                                    onChange={(e) => setAiGoal(e.target.value)}
                                />
                                <div className="mt-4 flex justify-end">
                                    <button 
                                        onClick={handleAIGenerate} 
                                        disabled={isAIGenerating || !aiGoal}
                                        className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 text-sm font-bold shadow-md shadow-emerald-600/10 transition"
                                    >
                                        {isAIGenerating ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16}/>}
                                        {isAIGenerating ? 'Generating...' : 'Generate Plan'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

// --- App Root ---

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const currentUser = db.getCurrentUser();
    if (currentUser) setUser(currentUser);
    setLoading(false);
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-emerald-600" size={40} /></div>;

  return (
    <HashRouter>
        {user ? (
            <AppContent user={user} setUser={setUser} />
        ) : (
            <AuthView onLogin={async (email) => {
                const u = await db.loginUser(email);
                setUser(u);
            }} />
        )}
    </HashRouter>
  );
};

export default App;