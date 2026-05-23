import { Module } from '@nestjs/common';
import { PolesService } from './poles.service';
import { PolesController } from './poles.controller';

@Module({
  controllers: [PolesController],
  providers: [PolesService],
  exports: [PolesService],
})
export class PolesModule {}
