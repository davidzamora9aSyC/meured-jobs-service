import { Body, Controller, Get, Headers, Param, Post, Query, UnauthorizedException } from '@nestjs/common';
import { JobsService } from '../jobs.service';
import { getMeuredContext } from '../jobs.types';
import { CreateJobPostDto } from '../dto/create-job-post.dto';

@Controller('job-posts')
export class JobPostsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  list(@Headers() headers: Record<string, string | undefined>, @Query('take') takeRaw?: string) {
    const take = Math.max(1, Math.min(parseInt(takeRaw ?? '20', 10) || 20, 50));
    return this.jobsService.listJobPosts(this.context(headers), { take });
  }

  @Get(':id')
  get(@Headers() headers: Record<string, string | undefined>, @Param('id') id: string) {
    return this.jobsService.getJobPost(this.context(headers), id);
  }

  @Post()
  create(@Headers() headers: Record<string, string | undefined>, @Body() dto: CreateJobPostDto) {
    return this.jobsService.createJobPost(this.context(headers), dto);
  }

  private context(headers: Record<string, string | undefined>) {
    try {
      const context = getMeuredContext(headers);
      if (context.activeProduct !== 'MEURED') throw new Error('Acceso MeuRed requerido');
      return context;
    } catch {
      throw new UnauthorizedException('Contexto MeuRed requerido');
    }
  }
}

