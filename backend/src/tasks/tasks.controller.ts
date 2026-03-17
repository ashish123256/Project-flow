import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto/task.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('projects/:projectId/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @GetUser('_id') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(userId.toString(), projectId, dto);
  }

  @Get()
  findAll(
    @GetUser('_id') userId: string,
    @Param('projectId') projectId: string,
    @Query() query: TaskQueryDto,
  ) {
    return this.tasksService.findAll(userId.toString(), projectId, query);
  }

  @Get(':id')
  findOne(
    @GetUser('_id') userId: string,
    @Param('projectId') projectId: string,
    @Param('id') taskId: string,
  ) {
    return this.tasksService.findOne(userId.toString(), projectId, taskId);
  }

  @Put(':id')
  update(
    @GetUser('_id') userId: string,
    @Param('projectId') projectId: string,
    @Param('id') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(userId.toString(), projectId, taskId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @GetUser('_id') userId: string,
    @Param('projectId') projectId: string,
    @Param('id') taskId: string,
  ) {
    return this.tasksService.remove(userId.toString(), projectId, taskId);
  }
}
