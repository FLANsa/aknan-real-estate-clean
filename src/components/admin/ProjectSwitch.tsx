'use client';
import { useEffect, useState } from 'react';
import { useAdminMapStore } from '@/store/adminMapStore';

interface Project {
  id: string;
  name: string;
  description?: string;
}

export default function ProjectSwitch() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeProjectId, setActiveProject } = useAdminMapStore();

  useEffect(()=>{
    fetchProjects();
  },[]);

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/projects');
      const data = await res.json();
      setProjects(data.items || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }

  const selectedProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium">المشروع:</label>
      <select 
        className="rounded border px-3 py-1 min-w-48"
        value={activeProjectId || ''}
        onChange={(e) => setActiveProject(e.target.value || null)}
        disabled={loading}
      >
        <option value="">جميع المشاريع</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
      
      {selectedProject && (
        <div className="text-sm text-gray-600">
          {selectedProject.description}
        </div>
      )}
    </div>
  );
}

