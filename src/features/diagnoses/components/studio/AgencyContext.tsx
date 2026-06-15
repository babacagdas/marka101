// src/features/diagnoses/components/studio/AgencyContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface LeadPotential {
  id: string;
  brandName: string;
  contactName: string;
  stage: 'initial' | 'meeting' | 'proposal' | 'won' | 'lost';
  value: string;
  notes: string[];
}

export interface WonClient {
  id: string;
  companyName: string;
  logoText: string;
  domain: string;
  contractDate: string;
  services: string[];
  contractValue: string;
  contractStatus: 'active' | 'expiring' | 'pending_renewal';
  history: { date: string; type: string; desc: string }[];
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  category: 'website' | 'marka' | 'sosyalmedya' | 'reklam';
  progress: number;
  status: 'planning' | 'in_progress' | 'review' | 'completed';
  budget: string;
  deadline: string;
}

export interface Task {
  id: string;
  title: string;
  projectName: string;
  assignee: { name: string; initials: string; color: string };
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
}

interface AgencyContextType {
  leads: LeadPotential[];
  clients: WonClient[];
  projects: Project[];
  tasks: Task[];
  updateLeadStage: (id: string, newStage: LeadPotential['stage']) => void;
  addLeadNote: (id: string, note: string) => void;
  addNewTask: (task: Omit<Task, 'id' | 'status'>) => void;
  toggleTaskStatus: (id: string) => void;
}

const AgencyContext = createContext<AgencyContextType | undefined>(undefined);

export function AgencyProvider({ children }: { readonly children: React.ReactNode }) {
  const [leads, setLeads] = useState<LeadPotential[]>([]);
  const [clients, setClients] = useState<WonClient[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load dynamic data from Supabase (diagnoses table)
  useEffect(() => {
    async function fetchDatabaseData() {
      try {
        const supabase = createClient();
        
        // Fetch all diagnoses submitted by companies in the survey
        const { data: dbDiagnoses, error: diagError } = await supabase
          .from('diagnoses')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (diagError) throw diagError;
        
        // Map diagnoses to LeadPotential
        const mappedLeads: LeadPotential[] = (dbDiagnoses ?? []).map((d) => {
          const sub = d.public_submission as any;
          const contactName = sub?.contactName || sub?.brandContext?.contactName || 'Yetkili Belirtilmemiş';
          const budgetVal = sub?.brandContext?.budget || 'Belirtilmemiş';
          
          let stage: LeadPotential['stage'] = 'initial';
          if (d.status === 'in_review') stage = 'meeting';
          else if (d.status === 'analyzed' || d.status === 'output_ready') stage = 'proposal';
          else if (d.status === 'completed') stage = 'won';
          else if (d.status === 'archived') stage = 'lost';
          
          return {
            id: d.id,
            brandName: d.brand_name,
            contactName,
            stage,
            value: budgetVal,
            notes: d.notes || ['Marka Teşhis Formu sisteme yüklendi.'],
          };
        });
        setLeads(mappedLeads);

        // Fetch clients from Supabase clients table
        const { data: dbClients } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });

        let finalClients: WonClient[] = [];
        if (dbClients && dbClients.length > 0) {
          finalClients = dbClients.map((c) => ({
            id: c.id,
            companyName: c.company_name,
            logoText: c.logo_text,
            domain: c.domain || '',
            contractDate: c.contract_date || '',
            services: c.services || [],
            contractValue: c.contract_value || '',
            contractStatus: c.contract_status || 'active',
            history: (c.history as any) || [],
          }));
        } else {
          // Fallback/Seed from won diagnoses if empty
          const wonDiagnoses = (dbDiagnoses ?? []).filter((d) => d.status === 'completed' || d.status === 'output_ready');
          if (wonDiagnoses.length > 0) {
            const seedRecords = wonDiagnoses.map((d) => {
              const sub = d.public_submission as any;
              const domain = sub?.brandContext?.website || `${d.brand_name.toLowerCase().replace(/\s+/g, '')}.com`;
              return {
                company_name: d.brand_name,
                logo_text: d.brand_name.slice(0, 2).toUpperCase(),
                domain,
                contract_date: new Date(d.created_at).toLocaleDateString('tr-TR'),
                services: ['Marka Teşhisi & Danışmanlık'],
                contract_value: sub?.brandContext?.budget || 'Belirtilmemiş',
                contract_status: 'active' as const,
                history: [
                  { date: new Date(d.created_at).toLocaleDateString('tr-TR'), type: 'Başvuru', desc: 'Marka101 teşhis formu başarıyla tamamlandı.' }
                ]
              };
            });
            const { data: inserted } = await supabase.from('clients').insert(seedRecords).select();
            if (inserted) {
              finalClients = inserted.map((c) => ({
                id: c.id,
                companyName: c.company_name,
                logoText: c.logo_text,
                domain: c.domain || '',
                contractDate: c.contract_date || '',
                services: c.services || [],
                contractValue: c.contract_value || '',
                contractStatus: c.contract_status || 'active',
                history: (c.history as any) || [],
              }));
            }
          }
        }
        setClients(finalClients);

        // Fetch projects from Supabase projects table
        const { data: dbProjects } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        let finalProjects: Project[] = [];
        if (dbProjects && dbProjects.length > 0) {
          finalProjects = dbProjects.map((p) => ({
            id: p.id,
            name: p.name,
            clientName: p.client_name,
            category: p.category as any,
            progress: p.progress ?? 0,
            status: p.status as any,
            budget: p.budget || '',
            deadline: p.deadline || '',
          }));
        } else {
          // Fallback/Seed from clients
          if (finalClients.length > 0) {
            const seedProjects = finalClients.map((c) => ({
              client_id: c.id,
              name: `${c.companyName} Marka Konumlandırma`,
              client_name: c.companyName,
              category: 'marka' as const,
              progress: 100,
              status: 'completed' as const,
              budget: c.contractValue,
              deadline: c.contractDate,
            }));
            const { data: insertedProj } = await supabase.from('projects').insert(seedProjects).select();
            if (insertedProj) {
              finalProjects = insertedProj.map((p) => ({
                id: p.id,
                name: p.name,
                clientName: p.client_name,
                category: p.category as any,
                progress: p.progress ?? 0,
                status: p.status as any,
                budget: p.budget || '',
                deadline: p.deadline || '',
              }));
            }
          }
        }
        setProjects(finalProjects);

        // Fetch tasks from Supabase tasks table
        const { data: dbTasks } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        let finalTasks: Task[] = [];
        if (dbTasks && dbTasks.length > 0) {
          finalTasks = dbTasks.map((t) => ({
            id: t.id,
            title: t.title,
            projectName: t.project_name,
            assignee: (t.assignee as any) || { name: 'Elena Creative', initials: 'EC', color: 'from-[#4f20c0] to-[#b5179e]' },
            deadline: t.deadline || '',
            priority: t.priority as any,
            status: t.status as any,
          }));
        } else {
          // Fallback/Seed from projects
          if (finalProjects.length > 0) {
            const seedTasks = finalProjects.map((p) => ({
              title: `Teşhis Raporu İncelemesi: ${p.clientName}`,
              project_name: p.name,
              assignee: { name: 'Elena Creative', initials: 'EC', color: 'from-[#4f20c0] to-[#b5179e]' },
              deadline: p.deadline,
              priority: 'high' as const,
              status: 'done' as const,
            }));
            const { data: insertedTasks } = await supabase.from('tasks').insert(seedTasks).select();
            if (insertedTasks) {
              finalTasks = insertedTasks.map((t) => ({
                id: t.id,
                title: t.title,
                projectName: t.project_name,
                assignee: (t.assignee as any) || { name: 'Elena Creative', initials: 'EC', color: 'from-[#4f20c0] to-[#b5179e]' },
                deadline: t.deadline || '',
                priority: t.priority as any,
                status: t.status as any,
              }));
            }
          }
        }
        setTasks(finalTasks);

      } catch (err) {
        console.error('Error fetching dynamic crm lists:', err);
      } finally {
        setIsLoaded(true);
      }
    }
    fetchDatabaseData();
  }, []);

  const updateLeadStage = async (id: string, newStage: LeadPotential['stage']) => {
    let dbStatus = 'new';
    if (newStage === 'meeting') dbStatus = 'in_review';
    else if (newStage === 'proposal') dbStatus = 'output_ready';
    else if (newStage === 'won') dbStatus = 'completed';
    else if (newStage === 'lost') dbStatus = 'archived';

    try {
      const supabase = createClient();
      await supabase
        .from('diagnoses')
        .update({ status: dbStatus })
        .eq('id', id);

      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, stage: newStage } : l))
      );

      // If marked as won, automatically create client and project in Supabase tables
      if (newStage === 'won') {
        const lead = leads.find((l) => l.id === id);
        if (lead) {
          const clientInsert = {
            company_name: lead.brandName,
            logo_text: lead.brandName.slice(0, 2).toUpperCase(),
            domain: `${lead.brandName.toLowerCase().replace(/\s+/g, '')}.com`,
            contract_date: new Date().toLocaleDateString('tr-TR'),
            services: ['Marka Teşhisi & Danışmanlık'],
            contract_value: lead.value || 'Belirtilmemiş',
            contract_status: 'active' as const,
            history: [
              { date: new Date().toLocaleDateString('tr-TR'), type: 'Başvuru', desc: 'Marka101 teşhis formu başarıyla tamamlandı.' }
            ]
          };
          const { data: clientData } = await supabase
            .from('clients')
            .insert(clientInsert)
            .select()
            .single();

          if (clientData) {
            setClients((prev) => [
              {
                id: clientData.id,
                companyName: clientData.company_name,
                logoText: clientData.logo_text,
                domain: clientData.domain || '',
                contractDate: clientData.contract_date || '',
                services: clientData.services || [],
                contractValue: clientData.contract_value || '',
                contractStatus: clientData.contract_status || 'active',
                history: (clientData.history as any) || [],
              },
              ...prev,
            ]);

            const projectInsert = {
              client_id: clientData.id,
              name: `${lead.brandName} Marka Konumlandırma`,
              client_name: lead.brandName,
              category: 'marka' as const,
              progress: 0,
              status: 'planning' as const,
              budget: lead.value || 'Belirtilmemiş',
              deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR'),
            };
            const { data: projectData } = await supabase
              .from('projects')
              .insert(projectInsert)
              .select()
              .single();

            if (projectData) {
              setProjects((prev) => [
                {
                  id: projectData.id,
                  name: projectData.name,
                  clientName: projectData.client_name,
                  category: projectData.category as any,
                  progress: projectData.progress ?? 0,
                  status: projectData.status as any,
                  budget: projectData.budget || '',
                  deadline: projectData.deadline || '',
                },
                ...prev,
              ]);

              const taskInsert = {
                title: `Teşhis Raporu İncelemesi: ${lead.brandName}`,
                project_name: `${lead.brandName} Marka Konumlandırma`,
                assignee: { name: 'Elena Creative', initials: 'EC', color: 'from-[#4f20c0] to-[#b5179e]' },
                deadline: new Date().toLocaleDateString('tr-TR'),
                priority: 'high' as const,
                status: 'todo' as const,
              };
              const { data: taskData } = await supabase
                .from('tasks')
                .insert(taskInsert)
                .select()
                .single();

              if (taskData) {
                setTasks((prev) => [
                  {
                    id: taskData.id,
                    title: taskData.title,
                    projectName: taskData.project_name,
                    assignee: (taskData.assignee as any) || { name: 'Elena Creative', initials: 'EC', color: 'from-[#4f20c0] to-[#b5179e]' },
                    deadline: taskData.deadline || '',
                    priority: taskData.priority as any,
                    status: taskData.status as any,
                  },
                  ...prev,
                ]);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Error updating diagnosis status:', err);
    }
  };

  const addLeadNote = async (id: string, note: string) => {
    try {
      const supabase = createClient();
      const lead = leads.find((l) => l.id === id);
      if (!lead) return;
      const updatedNotes = [...lead.notes, note];

      await supabase
        .from('diagnoses')
        .update({ notes: updatedNotes })
        .eq('id', id);

      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, notes: updatedNotes } : l))
      );
    } catch (err) {
      console.error('Error saving diagnosis note:', err);
    }
  };

  const toggleTaskStatus = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const nextStatus: Task['status'] = task.status === 'done' ? 'todo' : 'done';

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );

    try {
      const supabase = createClient();
      await supabase
        .from('tasks')
        .update({ status: nextStatus })
        .eq('id', id);
    } catch (err) {
      console.error('Error toggling task status:', err);
    }
  };

  const addNewTask = async (task: Omit<Task, 'id' | 'status'>) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: task.title,
          project_name: task.projectName,
          assignee: task.assignee,
          deadline: task.deadline,
          priority: task.priority,
          status: 'todo' as const,
        })
        .select()
        .single();

      if (data) {
        setTasks((prev) => [
          {
            id: data.id,
            title: data.title,
            projectName: data.project_name,
            assignee: (data.assignee as any) || { name: 'Elena Creative', initials: 'EC', color: 'from-[#4f20c0] to-[#b5179e]' },
            deadline: data.deadline || '',
            priority: data.priority as any,
            status: data.status as any,
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error('Error adding new task:', err);
    }
  };

  return (
    <AgencyContext.Provider
      value={{
        leads,
        clients,
        projects,
        tasks,
        updateLeadStage,
        addLeadNote,
        addNewTask,
        toggleTaskStatus,
      }}
    >
      {children}
    </AgencyContext.Provider>
  );
}


export function useAgency() {
  const context = useContext(AgencyContext);
  if (!context) {
    throw new Error('useAgency must be used within an AgencyProvider');
  }
  return context;
}
