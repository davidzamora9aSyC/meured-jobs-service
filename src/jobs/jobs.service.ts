import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeuredContext } from './jobs.types';
import { CreateJobPostDto } from './dto/create-job-post.dto';
import { ApplyJobDto } from './dto/apply-job.dto';
import { RabbitPublisher } from '../rabbitmq/rabbitmq.publisher';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly publisher: RabbitPublisher,
  ) {}

  listJobPosts(_context: MeuredContext, params: { take: number }) {
    return this.prisma.meuredJobPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: params.take,
    });
  }

  async getJobPost(_context: MeuredContext, id: string) {
    const post = await this.prisma.meuredJobPost.findUnique({ where: { id } });
    if (!post || post.status !== 'PUBLISHED') throw new NotFoundException('Vacante no encontrada');
    return post;
  }

  async createJobPost(context: MeuredContext, dto: CreateJobPostDto) {
    const title = dto.title.trim();
    const description = dto.description.trim();
    if (!title || !description) throw new BadRequestException('title/description requeridos');
    const post = await this.prisma.meuredJobPost.create({
      data: {
        createdByAuthUserId: context.authUserId,
        entityId: dto.entityId ?? null,
        title,
        description,
        status: 'PUBLISHED',
      },
    });

    await this.publisher.publish('meured.jobs.job-post.created', {
      actorAuthUserId: context.authUserId,
      objectType: 'jobPost',
      objectId: post.id,
      payload: { jobPostId: post.id, entityId: post.entityId, title: post.title },
      occurredAt: post.createdAt.toISOString(),
    });
    return post;
  }

  async applyToJob(context: MeuredContext, jobPostId: string, dto: ApplyJobDto) {
    const job = await this.prisma.meuredJobPost.findUnique({ where: { id: jobPostId } });
    if (!job || job.status !== 'PUBLISHED') throw new NotFoundException('Vacante no encontrada');
    const application = await this.prisma.meuredJobApplication.upsert({
      where: { jobPostId_applicantAuthUserId: { jobPostId, applicantAuthUserId: context.authUserId } },
      create: {
        jobPostId,
        applicantAuthUserId: context.authUserId,
        coverLetter: dto.coverLetter?.trim() || null,
        status: 'SUBMITTED',
      },
      update: {
        coverLetter: dto.coverLetter?.trim() || null,
      },
    });

    await this.publisher.publish('meured.jobs.application.submitted', {
      actorAuthUserId: context.authUserId,
      objectType: 'jobApplication',
      objectId: application.id,
      payload: { jobPostId, status: application.status },
      occurredAt: application.createdAt.toISOString(),
    });
    return { ok: true, application };
  }

  getMyApplication(context: MeuredContext, jobPostId: string) {
    return this.prisma.meuredJobApplication.findUnique({
      where: { jobPostId_applicantAuthUserId: { jobPostId, applicantAuthUserId: context.authUserId } },
    });
  }

  listMyBookmarks(context: MeuredContext) {
    return this.prisma.meuredJobBookmark.findMany({
      where: { authUserId: context.authUserId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async bookmark(context: MeuredContext, jobPostId: string) {
    const job = await this.prisma.meuredJobPost.findUnique({ where: { id: jobPostId }, select: { id: true } });
    if (!job) throw new NotFoundException('Vacante no encontrada');
    const bookmark = await this.prisma.meuredJobBookmark.upsert({
      where: { authUserId_jobPostId: { authUserId: context.authUserId, jobPostId } },
      create: { authUserId: context.authUserId, jobPostId },
      update: {},
    });

    await this.publisher.publish('meured.jobs.bookmark.created', {
      actorAuthUserId: context.authUserId,
      objectType: 'jobBookmark',
      objectId: bookmark.id,
      payload: { jobPostId },
      occurredAt: bookmark.createdAt.toISOString(),
    });
    return { ok: true, bookmark };
  }

  async unbookmark(context: MeuredContext, jobPostId: string) {
    const existing = await this.prisma.meuredJobBookmark.findUnique({
      where: { authUserId_jobPostId: { authUserId: context.authUserId, jobPostId } },
      select: { id: true },
    });
    await this.prisma.meuredJobBookmark.deleteMany({ where: { authUserId: context.authUserId, jobPostId } });

    await this.publisher.publish('meured.jobs.bookmark.deleted', {
      actorAuthUserId: context.authUserId,
      objectType: 'jobBookmark',
      objectId: existing?.id ?? jobPostId,
      payload: { jobPostId },
      occurredAt: new Date().toISOString(),
    });
    return { ok: true };
  }

  async ensureOwner(context: MeuredContext, jobPostId: string) {
    const job = await this.prisma.meuredJobPost.findUnique({ where: { id: jobPostId } });
    if (!job) throw new NotFoundException('Vacante no encontrada');
    if (job.createdByAuthUserId !== context.authUserId) throw new ForbiddenException('No autorizado');
    return job;
  }
}
