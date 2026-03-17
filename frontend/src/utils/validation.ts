import * as yup from 'yup';

export const registerSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .required('Name is required'),
  email: yup
    .string()
    .trim()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Must contain at least one lowercase letter')
    .matches(/\d/, 'Must contain at least one number')
    .required('Password is required'),
});

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup.string().min(1, 'Password is required').required('Password is required'),
});

export const projectSchema = yup.object({
  title: yup
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must not exceed 100 characters')
    .required('Title is required'),
  description: yup.string().trim().max(1000, 'Description must not exceed 1000 characters'),
  status: yup.string().oneOf(['active', 'completed']).required(),
});

export const taskSchema = yup.object({
  title: yup
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title must not exceed 200 characters')
    .required('Title is required'),
  description: yup.string().trim().max(2000, 'Description must not exceed 2000 characters'),
  status: yup.string().oneOf(['todo', 'in-progress', 'done']).required(),
  dueDate: yup.string().optional().transform((v) => v || undefined),
});

export type RegisterFormData   = yup.InferType<typeof registerSchema>;
export type LoginFormData      = yup.InferType<typeof loginSchema>;
export type ProjectFormData    = yup.InferType<typeof projectSchema>;
export type TaskFormData       = yup.InferType<typeof taskSchema>;
