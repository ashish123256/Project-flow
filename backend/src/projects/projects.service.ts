import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, SortOrder, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto, ProjectQueryDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async create(userId: string, dto: CreateProjectDto): Promise<ProjectDocument> {
    const project = new this.projectModel({
      ...dto,
      owner: new Types.ObjectId(userId)
    });

    return project.save();
  }
  async findAll(userId: string, query: ProjectQueryDto) {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build filter query
    const filter: FilterQuery<ProjectDocument> = {  owner: new Types.ObjectId(userId),};

    if (status) {
      filter.status = status;
    }

    if (search && search.trim()) {
      // Use MongoDB text search if index is set up, fallback to regex
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Build sort object
    const sort: Record<string, SortOrder> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    // Run count and data queries in parallel for performance
    const [total, projects] = await Promise.all([
      this.projectModel.countDocuments(filter),
      this.projectModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
    ]);

    return {
      message: 'Projects fetched successfully',
      data: {
        projects,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
    };
  }

  async findOne(userId: string, projectId: string): Promise<any> {
    const project = await this.projectModel
      .findById(projectId)
      .lean()
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.owner.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async update(
    userId: string,
    projectId: string,
    dto: UpdateProjectDto,
  ): Promise<ProjectDocument> {
    const project = await this.projectModel.findById(projectId).exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.owner.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    Object.assign(project, dto);
    return project.save();
  }

  async remove(userId: string, projectId: string): Promise<void> {
    const project = await this.projectModel.findById(projectId).exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.owner.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    await project.deleteOne();
  }

  async getStats(userId: string) {
    const stats = await this.projectModel.aggregate([
      { $match: { owner: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = { total: 0, active: 0, completed: 0 };
    stats.forEach((s) => {
      result[s._id as keyof typeof result] = s.count;
      result.total += s.count;
    });

    return result;
  }
}
