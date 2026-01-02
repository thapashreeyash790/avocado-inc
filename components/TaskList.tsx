import React from 'react';
import { Task, TaskStatus, TaskPriority, UserRole } from '../types';
import { Circle, CheckCircle2, AlertCircle } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  userRole: UserRole;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, userRole, onUpdateStatus, onEditTask }) => {
  const canEdit = userRole !== 'CLIENT';

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
        case TaskStatus.DONE: return <CheckCircle2 size={20} className="text-emerald-500" />;
        case TaskStatus.IN_PROGRESS: return <div className="w-5 h-5 border-2 border-emerald-500 rounded-full border-t-transparent animate-spin" />;
        default: return <Circle size={20} className="text-slate-300" />;
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
        case TaskPriority.URGENT: return 'text-rose-500';
        case TaskPriority.HIGH: return 'text-amber-500';
        case TaskPriority.MEDIUM: return 'text-emerald-500';
        default: return 'text-slate-400';
    }
  };

  const nextStatus = (current: TaskStatus): TaskStatus => {
      if (current === TaskStatus.TODO) return TaskStatus.IN_PROGRESS;
      if (current === TaskStatus.IN_PROGRESS) return TaskStatus.REVIEW;
      if (current === TaskStatus.REVIEW) return TaskStatus.DONE;
      return TaskStatus.TODO;
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-6 p-5 bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <div className="col-span-6 pl-2">Task Name</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-2">Assignee</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-50">
            {tasks.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-medium">No tasks found. Create one to get started!</div>
            ) : tasks.map(task => (
                <div 
                    key={task.id} 
                    className={`
                        grid grid-cols-12 gap-6 p-4 items-center hover:bg-slate-50/80 transition-all duration-200 group
                        ${canEdit ? 'cursor-pointer' : 'cursor-default'}
                    `}
                    onClick={() => onEditTask(task)}
                >
                    <div className="col-span-6 flex items-center gap-4 pl-2">
                         <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if (canEdit) onUpdateStatus(task.id, nextStatus(task.status));
                            }}
                            disabled={!canEdit}
                            className={`transition-all duration-200 ${canEdit ? 'hover:scale-110 hover:opacity-80' : 'cursor-not-allowed opacity-50'}`}
                         >
                            {getStatusIcon(task.status)}
                         </button>
                         <div>
                            <p className={`text-sm font-semibold ${task.status === TaskStatus.DONE ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-800'}`}>
                                {task.title}
                            </p>
                         </div>
                    </div>
                    
                    <div className="col-span-2">
                        <span className={`
                            inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                            ${task.status === TaskStatus.DONE ? 'bg-emerald-100 text-emerald-700' : ''}
                            ${task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' : ''}
                            ${task.status === TaskStatus.TODO ? 'bg-slate-100 text-slate-500' : ''}
                            ${task.status === TaskStatus.REVIEW ? 'bg-amber-100 text-amber-700' : ''}
                        `}>
                            {task.status.replace('_', ' ')}
                        </span>
                    </div>

                    <div className="col-span-2 flex items-center gap-2">
                        <AlertCircle size={16} className={getPriorityColor(task.priority)} />
                        <span className="text-xs font-medium text-slate-600 capitalize">{task.priority.toLowerCase()}</span>
                    </div>

                    <div className="col-span-2 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs text-emerald-700 font-bold border-2 border-white shadow-sm ring-1 ring-slate-100">
                            JD
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TaskList;