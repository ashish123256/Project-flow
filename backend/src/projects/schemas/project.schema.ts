import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;
export type ProjectStatus = 'active' | 'completed';

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
export class Project {
  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
    index: 'text', // full-text search support
  })
  title: string;

  @Prop({
    trim: true,
    maxlength: 1000,
    default: '',
  })
  description: string;

  @Prop({
    type: String,
    enum: ['active', 'completed'],
    default: 'active',
    index: true,
  })
  status: ProjectStatus;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  owner: Types.ObjectId;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Compound index: fast queries for a user's projects
ProjectSchema.index({ owner: 1, createdAt: -1 });
ProjectSchema.index({ owner: 1, status: 1 });
// Text index for search
ProjectSchema.index({ title: 'text', description: 'text' });
