import { Body, Controller, Get, Headers, Param, Post, UnauthorizedException } from '@nestjs/common';
import { JobsService } from '../jobs.service';
import { getMeuredContext } from '../jobs.types';
import { ApplyJobDto } from '../dto/apply-job.dto';

@Controller('job-posts/:jobPostId/applications')
export class ApplicationsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('me')
  myApplication(
    @Headers() headers: Record<string, string | undefined>,
    @Param('jobPostId') jobPostId: string,
  ) {
    return this.jobsService.getMyApplication(this.context(headers), jobPostId);
  }

  @Post('me')
  apply(
    @Headers() headers: Record<string, string | undefined>,
    @Param('jobPostId') jobPostId: string,
    @Body() dto: ApplyJobDto,
  ) {
    return this.jobsService.applyToJob(this.context(headers), jobPostId, dto);
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

