// src/app/(studio)/studio/projeler/page.tsx
'use client';

import { useState } from 'react';
import { useAgency } from '@/features/diagnoses/components/studio/AgencyContext';

export default function ProjelerPage() {
  const { projects, tasks } = useAgency();
  const [activeTab, setActiveTab] = useState<'all' | 'website' | 'marka' | 'sosyalmedya' | 'reklam'>('all');

  const filteredProjects = projects.filter((p) => activeTab === 'all' || p.category === activeTab);

  const categories = [
    { key: 'all', label: 'Tüm Projeler' },
    { key: 'website', label: 'Website Projeleri' },
    { key: 'marka', label: 'Marka Projeleri' },
    { key: 'sosyalmedya', label: 'Sosyal Medya Projeleri' },
    { key: 'reklam', label: 'Reklam Projeleri' },
  ] as const;

  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-12 text-gray-700 px-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/50 pb-5">
        <div>
          <h1 className="text-xl font-black text-gray-800 tracking-tight">Projeler (Projects Hub)</h1>
          <p className="text-xs text-gray-400 mt-1">
            Website tasarımı, kurumsal kimlik, dijital pazarlama ve reklam kampanyası yönetim merkezleri.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card rounded-md p-2 flex flex-wrap gap-2 justify-start no-print">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveTab(cat.key)}
            className={`px-4 py-2 rounded text-xs font-black transition-all border ${
              activeTab === cat.key
                ? 'bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white border-transparent shadow-md shadow-purple-500/10'
                : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project) => {
          // Status styles
          const status = project.status === 'planning'
            ? { label: 'Planlanıyor', color: 'text-indigo-650 bg-indigo-50 border-indigo-100' }
            : project.status === 'in_progress'
            ? { label: 'Devam Ediyor', color: 'text-amber-600 bg-amber-50 border-amber-100' }
            : project.status === 'review'
            ? { label: 'Gözden Geçirme', color: 'text-purple-650 bg-purple-50 border-purple-100' }
            : { label: 'Tamamlandı', color: 'text-emerald-650 bg-emerald-50 border-emerald-100' };

          const projectTasks = tasks.filter((t) => t.projectName === project.name);
          const totalTasks = projectTasks.length;
          const doneTasks = projectTasks.filter((t) => t.status === 'done').length;
          return (
            <div
              key={project.id}
              className="glass-card glass-card-hover rounded-md p-6 flex flex-col justify-between space-y-6"
            >
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">
                      {project.clientName}
                    </span>
                    <h3 className="font-black text-gray-800 text-base mt-1 leading-snug">{project.name}</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-sm text-[9px] font-black border shrink-0 ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 text-xs font-semibold text-gray-400">
                  <div>
                    <span className="text-[8px] font-bold text-gray-400 block uppercase tracking-wider">Teslim Tarihi</span>
                    <span className="text-gray-750 mt-1 block font-black">{project.deadline}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-gray-400 block uppercase tracking-wider">Bütçe / Değer</span>
                    <span className="text-[#4f20c0] mt-1 block font-black">{project.budget}</span>
                  </div>
                </div>
              </div>

              {/* Progress and task metrics */}
              <div className="space-y-3 pt-3 border-t border-gray-150">
                <div className="flex justify-between text-[10px] font-black text-gray-550">
                  <span>Görevler: {doneTasks} / {totalTasks}</span>
                  <span className="text-gray-850">{project.progress}% Tamamlandı</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#4f20c0] to-[#b5179e] rounded-full shadow-sm"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        {filteredProjects.length === 0 && (
          <div className="col-span-2 py-16 text-center text-xs text-gray-400 font-bold glass-card rounded-md">
            Bu kategoride aktif proje bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
}
