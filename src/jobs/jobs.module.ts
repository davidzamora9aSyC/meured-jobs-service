import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { JobsService } from './jobs.service';
import { JobPostsController } from './controllers/job-posts.controller';
import { ApplicationsController } from './controllers/applications.controller';
import { BookmarksController } from './controllers/bookmarks.controller';

@Module({
  imports: [PrismaModule, RabbitmqModule],
  providers: [JobsService],
  controllers: [JobPostsController, ApplicationsController, BookmarksController],
})
export class JobsModule {}
