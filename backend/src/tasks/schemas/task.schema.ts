import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type TaskDocument = Task & Document;
export type TaskStatus = 'todo' | 'in-progress' | 'done';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_: any, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Task {
  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 200,
  })
  title: string;

  @Prop({
    trim: true,
    maxlength: 2000,
    default: '',
  })
  description: string;

  @Prop({
    type: String,
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo',
    index: true,
  })
  status: TaskStatus;

  @Prop({
    type: Date,
    default: null,
  })
  dueDate: Date | null;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  })
  project: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  owner: Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

// Compound indexes for efficient task queries
TaskSchema.index({ project: 1, status: 1 });
TaskSchema.index({ project: 1, createdAt: -1 });
TaskSchema.index({ owner: 1, dueDate: 1 });
