import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);
  constructor(private prisma: PrismaService) {}

  async upload(file: Express.Multer.File, incidentId: string | undefined, userId: string) {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const ext = path.extname(file.originalname);
    const fileName = `${uuid()}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    return this.prisma.attachment.create({
      data: {
        fileName: file.originalname,
        filePath,
        fileType: file.mimetype,
        fileSize: file.size,
        incidentId: incidentId || null,
        uploadedById: userId,
      },
    });
  }
}
