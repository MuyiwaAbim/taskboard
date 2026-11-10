import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Priority, Status, Task } from '../types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      // 1. Ensure a guest session exists (auto-created on first launch)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
      }
      // 2. Fetch tasks (RLS restricts to this guest's rows)
      const { data, error } = await supabase
        .from('tasks').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setTasks(data as Task[]);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createTask = async (input: {
    title: string; description?: string; priority: Priority; due_date?: string | null;
  }) => {
    const { data, error } = await supabase.from('tasks').insert({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      priority: input.priority,
      due_date: input.due_date || null,
    }).select().single();
    if (error) throw error;
    setTasks(t => [data as Task, ...t]);
  };

  // Optimistic update with rollback on failure
  const moveTask = async (id: string, status: Status) => {
    const prev = tasks;
    setTasks(t => t.map(x => (x.id === id ? { ...x, status } : x)));
    const { error } = await supabase.from('tasks').update({ status }).eq('id', id);
    if (error) { setTasks(prev); setError('Could not move task. Reverted.'); }
  };

  const updateTask = async (id: string, patch: Partial<Task>) => {
    const { data, error } = await supabase.from('tasks').update(patch).eq('id', id).select().single();
    if (error) throw error;
    setTasks(t => t.map(x => (x.id === id ? (data as Task) : x)));
  };

  const deleteTask = async (id: string) => {
    const prev = tasks;
    setTasks(t => t.filter(x => x.id !== id));
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) { setTasks(prev); setError('Could not delete task.'); }
  };

  return { tasks, loading, error, setError, reload: load, createTask, moveTask, updateTask, deleteTask };
}