import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, Public } from './auth/auth.module';
import { databaseOptions } from './data-source';

@Controller()
class HealthController {
  @Public()
  @Get('health')
  health() { return { status: 'ok' }; }
}

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TypeOrmModule.forRoot(databaseOptions), AuthModule],
  controllers: [HealthController],
})
export class AppModule {}
