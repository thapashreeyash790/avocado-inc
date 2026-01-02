import React, { useState, useEffect } from 'react';
import { Task, User, Comment, TaskStatus, TaskPriority } from '../types';
import * as db from '../services/mockBackend';
import { X, Send, Clock, User as UserIcon, MessageSquare, AlertCircle } from 'lucide-react';

interface TaskDetailModalProps {
  task: Task;
  currentUser: User;
  onClose: () => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, currentUser, onClose, onUpdateTask }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadComments();
  }, [task.id]);

  const loadComments = async () => {
    setIsLoadingComments(true);
    const data = await db.getComments(task.id);
    setComments(data);
    setIsLoadingComments(false);
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    setIsSending(true);
    const comment = await db.addComment(task.id, currentUser, newComment);
    setComments([comment, ...comments]);
    setNewComment('');
    setIsSending(false);
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const canEdit = currentUser.role !== 'CLIENT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Left Side: Task Details */}
        <div className="flex-1 p-8 overflow-y-auto border-r border-slate-100">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-2">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-500`}>
                    {task.projectId ? 'Project Task' : 'Task'}
                </span>
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider 
                    ${task.priority === TaskPriority.URGENT ? 'bg-rose-100 text-rose-700' : 
                      task.priority === TaskPriority.HIGH ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {task.priority}
                </span>
            </div>
            {/* Mobile Close Button (visible only on small screens usually, but here generally useful) */}
            <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600">
                <X size={24} />
            </button>
          </div>

          <h1 className="text-3xl font-bold text-slate-800 mb-6 leading-tight">{task.title}</h1>

          <div className="space-y-6">
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Status</label>
                <div className="flex gap-2 flex-wrap">
                    {Object.values(TaskStatus).map(status => (
                        <button
                            key={status}
                            disabled={!canEdit}
                            onClick={() => onUpdateTask(task.id, { status })}
                            className={`
                                px-4 py-2 rounded-lg text-sm font-semibold transition-all border
                                ${task.status === status 
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'}
                                ${!canEdit && task.status !== status ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            {status.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Description</label>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 leading-relaxed min-h-[120px]">
                    {task.description || <span className="text-slate-400 italic">No description provided.</span>}
                </div>
            </div>

            <div className="flex gap-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Clock size={16} />
                    <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <UserIcon size={16} />
                    <span>Assignee: Unassigned</span>
                </div>
            </div>
          </div>
        </div>

        {/* Right Side: Activity & Comments */}
        <div className="w-full md:w-96 bg-slate-50/50 flex flex-col border-l border-slate-100 h-full">
            <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2 font-bold text-slate-700">
                    <MessageSquare size={18} className="text-emerald-600"/>
                    Activity
                </div>
                <button onClick={onClose} className="hidden md:block text-slate-400 hover:text-slate-600 transition">
                    <X size={20} />
                </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoadingComments ? (
                    <div className="text-center py-10 text-slate-400 text-sm">Loading discussion...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                            <MessageSquare size={20} />
                        </div>
                        <p className="text-slate-500 text-sm">No comments yet.</p>
                        <p className="text-slate-400 text-xs mt-1">Start the conversation!</p>
                    </div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="flex gap-3 group">
                            <img src={comment.userAvatar} alt={comment.userName} className="w-8 h-8 rounded-full border border-slate-200 mt-1" />
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-sm font-bold text-slate-800">{comment.userName}</span>
                                    <span className="text-[10px] text-slate-400">{formatDate(comment.createdAt)}</span>
                                </div>
                                <div className="bg-white p-3 rounded-lg rounded-tl-none border border-slate-200 text-sm text-slate-700 shadow-sm">
                                    {comment.content}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <div className="relative">
                    <textarea 
                        className="w-full border border-slate-200 rounded-xl pl-4 pr-12 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm resize-none bg-slate-50 focus:bg-white transition"
                        placeholder="Write a comment..."
                        rows={2}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendComment();
                            }
                        }}
                    />
                    <button 
                        onClick={handleSendComment}
                        disabled={!newComment.trim() || isSending}
                        className="absolute right-2 bottom-2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition"
                    >
                        <Send size={16} />
                    </button>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 text-center">
                    Using simulated server. Comments are stored locally.
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;