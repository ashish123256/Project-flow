import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { projectSchema, type ProjectFormData } from '@/utils/validation';
import type { Project } from '@/types';

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => void;
  isLoading: boolean;
  project?: Project | null; // null = create mode
}

const statusOptions = [
  { value: 'active',    label: 'Active'    },
  { value: 'completed', label: 'Completed' },
];

export function ProjectForm({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  project,
}: ProjectFormProps) {
  const isEdit = !!project;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: yupResolver(projectSchema),
    defaultValues: {
      title:       project?.title       ?? '',
      description: project?.description ?? '',
      status:      project?.status      ?? 'active',
    },
  });

  // Sync form values when project changes (edit mode)
  useEffect(() => {
    if (isOpen) {
      reset({
        title:       project?.title       ?? '',
        description: project?.description ?? '',
        status:      (project?.status as 'active' | 'completed') ?? 'active',
      });
    }
  }, [isOpen, project, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Project' : 'New Project'}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            isLoading={isLoading}
          >
            {isEdit ? 'Save Changes' : 'Create Project'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Project Title"
          placeholder="e.g. E-Commerce Redesign"
          error={errors.title?.message}
          {...register('title')}
        />

        <div>
          <label className="label">Description</label>
          <textarea
            rows={3}
            placeholder="What is this project about? (optional)"
            className={`input resize-none ${errors.description ? 'input-error' : ''}`}
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1.5 text-xs text-red-500">⚠ {errors.description.message}</p>
          )}
        </div>

        <Select
          label="Status"
          options={statusOptions}
          error={errors.status?.message}
          {...register('status')}
        />
      </form>
    </Modal>
  );
}
