import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, SortOrder } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { ProjectsService } from '../projects/projects.service';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(
    userId: string,
    projectId: string,
    dto: CreateTaskDto,
  ): Promise<TaskDocument> {
    // Verify user owns the project (throws if not)
    await this.projectsService.findOne(userId, projectId);

    const task = new this.taskModel({
      ...dto,
      project: projectId,
      owner: userId,
    });

    return task.save();
  }

  async findAll(
    userId: string,
    projectId: string,
    query: TaskQueryDto,
  ) {
    // Verify user owns the project
    await this.projectsService.findOne(userId, projectId);

    const {
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: FilterQuery<TaskDocument> = { project: projectId };

    if (status) {
      filter.status = status;
    }

    const sort: Record<string, SortOrder> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const tasks = await this.taskModel
      .find(filter)
      .sort(sort)
      .lean()
      .exec();

    // Return grouped task counts too
    const counts = { todo: 0, 'in-progress': 0, done: 0, total: tasks.length };
    tasks.forEach((t) => {
      counts[t.status as keyof typeof counts]++;
    });

    return {
      message: 'Tasks fetched successfully',
      data: { tasks, counts },
    };
  }

  async findOne(
    userId: string,
    projectId: string,
    taskId: string,
  ): Promise<any> {
    await this.projectsService.findOne(userId, projectId);

    const task = await this.taskModel
      .findOne({ _id: taskId, project: projectId })
      .lean()
      .exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(
    userId: string,
    projectId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ): Promise<TaskDocument> {
    await this.projectsService.findOne(userId, projectId);

    const task = await this.taskModel
      .findOne({ _id: taskId, project: projectId })
      .exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    Object.assign(task, dto);
    return task.save();
  }

  async remove(
    userId: string,
    projectId: string,
    taskId: string,
  ): Promise<void> {
    await this.projectsService.findOne(userId, projectId);

    const task = await this.taskModel
      .findOne({ _id: taskId, project: projectId })
      .exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await task.deleteOne();
  }

  // Delete all tasks belonging to a project (used when project is deleted)
  async removeAllByProject(projectId: string): Promise<void> {
    await this.taskModel.deleteMany({ project: projectId }).exec();
  }
}
