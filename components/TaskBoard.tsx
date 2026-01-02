import React from 'react';
import { Task, TaskStatus, TaskPriority, UserRole } from '../types';
import { MoreHorizontal, Plus, Clock } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  userRole: UserRole;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
}

const COLUMNS = [
  { id: TaskStatus.TODO, label: 'To Do', color: 'bg-slate-400', border: 'border-slate-200' },
  { id: TaskStatus.IN_PROGRESS, label: 'In Progress', color: 'bg-emerald-500', border: 'border-emerald-200' },
  { id: TaskStatus.REVIEW, label: 'Review', color: 'bg-amber-500', border: 'border-amber-200' },
  { id: TaskStatus.DONE, label: 'Done', color: 'bg-teal-600', border: 'border-teal-200' },
];

const PriorityBadge = ({ priority }: { priority: TaskPriority }) => {
    const colors = {
        [TaskPriority.LOW]: 'text-slate-500 bg-slate-100',
        [TaskPriority.MEDIUM]: 'text-emerald-600 bg-emerald-50',
        [TaskPriority.HIGH]: 'text-amber-600 bg-amber-50',
        [TaskPriority.URGENT]: 'text-rose-600 bg-rose-50',
    };
    return (
        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${colors[priority]}`}>
            {priority}
        </span>
    );
};

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, userRole, onUpdateStatus, onEditTask }) => {
  
  const canMove = userRole !== 'CLIENT';

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    if (!canMove) {
        e.preventDefault();
        return;
    }
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!canMove) return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    if (!canMove) return;
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
        onUpdateStatus(taskId, status);
    }
  };

  return (
    <div className="h-full overflow-x-auto overflow-y-hidden whitespace-nowrap p-8 bg-slate-50">
      <div className="flex h-full gap-8">
        {COLUMNS.map((col) => {
            const columnTasks = tasks.filter(t => t.status === col.id);
            
            return (
                <div 
                    key={col.id} 
                    className={`w-80 flex-shrink-0 flex flex-col h-full bg-slate-100/50 rounded-2xl border ${col.border}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                >
                    {/* Column Header */}
                    <div className="p-4 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <span className={`w-3 h-3 rounded-full ${col.color} shadow-sm`} />
                            <h3 className="font-bold text-slate-700 text-sm tracking-wide">{col.label}</h3>
                            <span className="px-2 py-0.5 bg-white text-slate-500 rounded-md text-xs font-bold border border-slate-200">
                                {columnTasks.length}
                            </span>
                        </div>
                        <div className="flex gap-1">
                             <button className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-white rounded-lg transition">
                                <MoreHorizontal size={16} />
                             </button>
                        </div>
                    </div>

                    {/* Column Body */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {columnTasks.map(task => (
                            <div
                                key={task.id}
                                draggable={canMove}
                                onDragStart={(e) => handleDragStart(e, task.id)}
                                onClick={() => onEditTask(task)}
                                className={`
                                    bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition group
                                    ${canMove ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <PriorityBadge priority={task.priority} />
                                    {canMove && (
                                        <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition">
                                            <MoreHorizontal size={14} />
                                        </button>
                                    )}
                                </div>
                                <h4 className="text-sm font-semibold text-slate-800 mb-1.5 whitespace-normal leading-relaxed">
                                    {task.title}
                                </h4>
                                {task.description && (
                                    <p className="text-xs text-slate-500 line-clamp-2 whitespace-normal mb-3 font-medium">
                                        {task.description}
                                    </p>
                                )}
                                <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-50">
                                    <div className="flex items-center gap-1.5 font-medium">
                                         <Clock size={13} />
                                         <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                        JD
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {columnTasks.length === 0 && (
                            <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-sm font-medium">
                                Empty
                            </div>
                        )}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default TaskBoard;