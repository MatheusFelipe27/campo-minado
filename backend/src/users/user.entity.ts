import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('users')
@Unique(['provider', 'providerAccountId'])
export class User {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true, length: 255 }) email!: string;
  @Column({ length: 255 }) name!: string;
  @Column({ type: 'text', nullable: true }) image!: string | null;
  @Column({ length: 20 }) provider!: string;
  @Column({ name: 'provider_account_id', length: 255 }) providerAccountId!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
