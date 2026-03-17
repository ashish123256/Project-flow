import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { taskSchema, type TaskFormData } from '@/utils/validation';
import type { Task } from '@/types';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  isLoading: boolean;
  task?: Task | null;
}

const statusOptions = [
  { value: 'todo',        label: 'To Do'       },
  { value: 'in-progress', label: 'In Progress'  },
  { value: 'done',        label: 'Done'         },
];

function toDateInputValue(date: string | null | undefined): string {
  if (!date) return '';
  try {
    return new Date(date).toISOString().split('T')[0];
  } catch {
    return '';
  }
}

export function TaskForm({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  task,
}: TaskFormProps) {
  const isEdit = !!task;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: yupResolver(taskSchema),
    defaultValues: {
      title:       task?.title       ?? '',
      description: task?.description ?? '',
      status:      task?.status      ?? 'todo',
      dueDate:     toDateInputValue(task?.dueDate),
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title:       task?.title       ?? '',
        description: task?.description ?? '',
        status:      (task?.status as 'todo' | 'in-progress' | 'done') ?? 'todo',
        dueDate:     toDateInputValue(task?.dueDate),
      });
    }
  }, [isOpen, task, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Task' : 'New Task'}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Task Title"
          placeholder="e.g. Design login screen"
          error={errors.title?.message}
          {...register('title')}
        />

        <div>
          <label className="label">Description</label>
          <textarea
            rows={3}
            placeholder="Add details about this task... (optional)"
            className={`input resize-none ${errors.description ? 'input-error' : ''}`}
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1.5 text-xs text-red-500">⚠ {errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Status"
            options={statusOptions}
            error={errors.status?.message}
            {...register('status')}
          />

          <Input
            label="Due Date"
            type="date"
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />
        </div>
      </form>
    </Modal>
  );
}
