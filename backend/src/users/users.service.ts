import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  async upsert(profile: Pick<User, 'provider' | 'providerAccountId' | 'email' | 'name' | 'image'>) {
    try {
      await this.users.upsert(profile, ['provider', 'providerAccountId']);
    } catch (error) {
      if (error instanceof QueryFailedError && 'constraint' in error.driverError &&
          error.driverError.constraint === 'users_email_key') {
        throw new ConflictException('E-mail já vinculado a outra conta');
      }
      throw error;
    }
    const { id, email, name, image } = await this.users.findOneByOrFail({
      provider: profile.provider, providerAccountId: profile.providerAccountId,
    });
    return { id, email, name, image };
  }
}
