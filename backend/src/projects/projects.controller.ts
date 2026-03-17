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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto, ProjectQueryDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @GetUser('_id') userId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(userId.toString(), dto);
  }

  @Get()
  findAll(
    @GetUser('_id') userId: string,
    @Query() query: ProjectQueryDto,
  ) {
    return this.projectsService.findAll(userId.toString(), query);
  }

  @Get('stats')
  getStats(@GetUser('_id') userId: string) {
    return this.projectsService.getStats(userId.toString());
  }

  @Get(':id')
  findOne(
    @GetUser('_id') userId: string,
    @Param('id') projectId: string,
  ) {
    return this.projectsService.findOne(userId.toString(), projectId);
  }

  @Put(':id')
  update(
    @GetUser('_id') userId: string,
    @Param('id') projectId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(userId.toString(), projectId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @GetUser('_id') userId: string,
    @Param('id') projectId: string,
  ) {
    return this.projectsService.remove(userId.toString(), projectId);
  }
}
