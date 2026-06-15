// src/app/(studio)/studio/gorevler/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAgency } from '@/features/diagnoses/components/studio/AgencyContext';
import { createClient } from '@/lib/supabase/client';

export default function GorevlerPage() {
  const { tasks, toggleTaskStatus, addNewTask, projects } = useAgency();

  const [activeFilter, setActiveFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskProject, setNewTaskProject] = useState('Genel İşler');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDeadline, setNewTaskDeadline] = useState('15.06.2026');

  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');

  useEffect(() => {
    async function fetchTeam() {
      const supabase = createClient();
      const { data } = await supabase.from('team_members').select('*').order('name');
      if (data) {
        setTeamMembers(data);
        if (data.length > 0) {
          setSelectedAssigneeId(data[0].id);
        }
      }
    }
    fetchTeam();
  }, []);

  const handleToggleStatus = (id: string) => {
    toggleTaskStatus(id);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const selectedMember = teamMembers.find(m => m.id === selectedAssigneeId);
    const assignee = selectedMember ? {
      name: selectedMember.name,
      initials: selectedMember.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
      color: selectedMember.avatar_color || 'from-[#4f20c0] to-[#b5179e]'
    } : { name: 'Elena Creative', initials: 'EC', color: 'from-[#4f20c0] to-[#b5179e]' };

    addNewTask({
      title: newTaskTitle.trim(),
      projectName: newTaskProject,
      assignee: assignee,
      deadline: newTaskDeadline,
      priority: newTaskPriority,
    });

    setNewTaskTitle('');
  };  const priorityColors = {
    low: 'text-[#8c869e] bg-white/5 border-white/5',
    medium: 'text-amber-500 bg-amber-950/20 border-amber-900/30',
    high: 'text-red-400 bg-red-950/20 border-red-900/30',
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'todo') return t.status === 'todo';
    if (activeFilter === 'in_progress') return t.status === 'in_progress' || t.status === 'todo';
    if (activeFilter === 'done') return t.status === 'done';
    return true;
  });

  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-12 text-[#c9c5d8] px-2 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Görevler (Task Manager)</h1>
          <p className="text-xs text-[#8c869e] mt-1">
            Ajans içi yapılacak işler, görev atamaları, son tarihler ve durum takibi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle Column: Tasks list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters Bar */}
          <div className="glass-card rounded-md p-4 flex justify-between items-center no-print border border-white/5">
            <div className="flex bg-[#0e0b1a] p-1 rounded border border-white/10 shadow-inner">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-1.5 rounded text-xs font-black transition-all ${
                  activeFilter === 'all'
                    ? 'bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white shadow-sm'
                    : 'text-[#8c869e] hover:text-[#f1ecf9]'
                }`}
              >
                Tümü ({tasks.length})
              </button>
              <button
                onClick={() => setActiveFilter('todo')}
                className={`px-4 py-1.5 rounded text-xs font-black transition-all ${
                  activeFilter === 'todo'
                    ? 'bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white shadow-sm'
                    : 'text-[#8c869e] hover:text-[#f1ecf9]'
                }`}
              >
                Yapılacaklar ({tasks.filter((t) => t.status === 'todo').length})
              </button>
              <button
                onClick={() => setActiveFilter('in_progress')}
                className={`px-4 py-1.5 rounded text-xs font-black transition-all ${
                  activeFilter === 'in_progress'
                    ? 'bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white shadow-sm'
                    : 'text-[#8c869e] hover:text-[#f1ecf9]'
                }`}
              >
                İşlemde ({tasks.filter((t) => t.status === 'in_progress').length})
              </button>
              <button
                onClick={() => setActiveFilter('done')}
                className={`px-4 py-1.5 rounded text-xs font-black transition-all ${
                  activeFilter === 'done'
                    ? 'bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white shadow-sm'
                    : 'text-[#8c869e] hover:text-[#f1ecf9]'
                }`}
              >
                Tamamlandı ({tasks.filter((t) => t.status === 'done').length})
              </button>
            </div>
          </div>

          {/* Checklist Area */}
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="glass-card glass-card-hover rounded-md p-4 flex items-center justify-between gap-4 border border-white/5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.status === 'done'}
                    onChange={() => handleToggleStatus(task.id)}
                    className="rounded border-white/10 bg-[#06050b] text-[#4f20c0] focus:ring-0 cursor-pointer w-4.5 h-4.5"
                  />
                  <div className="min-w-0">
                    <span
                      className={`text-xs font-black block truncate leading-snug ${
                        task.status === 'done' ? 'line-through text-[#8c869e] font-normal' : 'text-[#f1ecf9]'
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="text-[9px] text-[#8c869e] block font-bold mt-0.5">
                      Proje: {task.projectName} • <span className="text-white/60">Görevli: {task.assignee.name}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black border ${priorityColors[task.priority]}`}>
                    {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
                  </span>
                  
                  <span className="text-[10px] text-[#8c869e] font-bold hidden sm:flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">schedule</span>
                    <span>{task.deadline}</span>
                  </span>
                  
                  {/* Assignee initials badge */}
                  <div
                    className="w-7 h-7 rounded bg-gradient-to-br from-[#4f20c0] to-[#b5179e] text-white flex items-center justify-center text-[9px] font-black shadow-inner"
                    title={`Atanan: ${task.assignee.name}`}
                  >
                    {task.assignee.initials}
                  </div>
                </div>
              </div>
            ))}
            {filteredTasks.length === 0 && (
              <p className="text-center py-12 text-xs text-[#8c869e] font-bold glass-card rounded-md border border-white/5">
                Aradığınız kriterlere uygun aktif görev bulunamadı.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Add task form */}
        <div className="space-y-4">
          <div className="glass-card rounded-md p-6 space-y-4 border border-white/5">
            <h3 className="font-black text-white text-sm">Hızlı Görev Ekle</h3>
            <form onSubmit={handleCreateTask} className="space-y-4 text-xs font-bold text-[#8c869e]">
              <div className="space-y-1">
                <label htmlFor="task-title-input" className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">Görev Tanımı</label>
                <input
                  id="task-title-input"
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Yapılacak iş..."
                  className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3.5 py-2.5 text-xs font-bold text-white placeholder-[#7d778f] focus:outline-none focus:border-[#4f20c0] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="task-project-selection" className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">İlgili Proje</label>
                <select
                  id="task-project-selection"
                  value={newTaskProject}
                  onChange={(e) => setNewTaskProject(e.target.value)}
                  className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3 py-2.5 text-xs font-bold text-white focus:outline-none cursor-pointer hover:border-[#4f20c0] transition-all"
                >
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.name} className="bg-[#0e0b1a]">
                      {proj.name}
                    </option>
                  ))}
                  <option value="Genel İşler" className="bg-[#0e0b1a]">Genel İşler</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="task-assignee-selection" className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">Atanan Kişi</label>
                <select
                  id="task-assignee-selection"
                  value={selectedAssigneeId}
                  onChange={(e) => setSelectedAssigneeId(e.target.value)}
                  className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3 py-2.5 text-xs font-bold text-white focus:outline-none cursor-pointer hover:border-[#4f20c0] transition-all"
                >
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id} className="bg-[#0e0b1a]">
                      {member.name} ({member.role})
                    </option>
                  ))}
                  {teamMembers.length === 0 && (
                    <option value="" className="bg-[#0e0b1a]">Elena Creative</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="task-priority-selection" className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">Öncelik</label>
                  <select
                    id="task-priority-selection"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full bg-[#0e0b1a] border border-white/10 rounded px-2.5 py-2.5 text-xs font-bold text-white focus:outline-none cursor-pointer hover:border-[#4f20c0] transition-all"
                  >
                    <option value="low" className="bg-[#0e0b1a]">Düşük</option>
                    <option value="medium" className="bg-[#0e0b1a]">Orta</option>
                    <option value="high" className="bg-[#0e0b1a]">Yüksek</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="task-deadline-input" className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">Son Tarih</label>
                  <input
                    id="task-deadline-input"
                    type="text"
                    required
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    placeholder="15.06.2026"
                    className="w-full bg-[#0e0b1a] border border-white/10 rounded px-2.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#4f20c0] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#4f20c0] to-[#b5179e] hover:scale-[1.02] text-white py-3 rounded font-extrabold text-xs shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transition-all mt-2 flex items-center justify-center gap-1.5 border-0"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Görev Ekle</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

