import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectsApi } from '../api/projects';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});

type ProjectForm = z.infer<typeof projectSchema>;

export default function NewProject() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
  });

  const onSubmit = async (data: ProjectForm) => {
    setIsSubmitting(true);
    try {
      const res = await projectsApi.create(data);
      toast.success('Project created successfully!');
      navigate(`/projects/${res.data?.id ?? ''}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-100">New Project</h2>
          <p className="text-slate-400 mt-1">Create a new project for your team</p>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
            <input
              type="text"
              {...register('name')}
              className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                errors.name ? 'border-rose-500/50' : 'border-slate-700/50'
              }`}
              placeholder="Enter project name"
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-rose-400">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none"
              placeholder="Describe your project..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:from-indigo-400 hover:to-purple-400 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
