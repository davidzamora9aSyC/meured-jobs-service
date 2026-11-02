import { Controller, Delete, Get, Headers, Param, Post, UnauthorizedException } from '@nestjs/common';
import { JobsService } from '../jobs.service';
import { getMeuredContext } from '../jobs.types';

@Controller('job-bookmarks')
export class BookmarksController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('me')
  list(@Headers() headers: Record<string, string | undefined>) {
    return this.jobsService.listMyBookmarks(this.context(headers));
  }

  @Post(':jobPostId')
  bookmark(@Headers() headers: Record<string, string | undefined>, @Param('jobPostId') jobPostId: string) {
    return this.jobsService.bookmark(this.context(headers), jobPostId);
  }

  @Delete(':jobPostId')
  unbookmark(@Headers() headers: Record<string, string | undefined>, @Param('jobPostId') jobPostId: string) {
    return this.jobsService.unbookmark(this.context(headers), jobPostId);
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

