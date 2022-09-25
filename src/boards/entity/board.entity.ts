import { User } from './../../users/entity/user.entity';
import { Entity, Column, OneToMany, ManyToOne, RelationId } from 'typeorm';
import { CoreEntity } from './../../common/entities/core.entity';

@Entity()
export class Board extends CoreEntity {
  @Column()
  title: string;

  @Column()
  boardImgName: string;

  @Column()
  boardImgSize: number;

  @Column()
  boardImgPath: string;

  @Column()
  content: string;

  @Column({ default: 0, nullable: true })
  views: number;

  @Column({ default: 0, nullable: true })
  rating: number;

  @ManyToOne((type) => User, (user) => user.boards, {
    onDelete: 'CASCADE',
  })
  owner: User;

  @RelationId((board: Board) => board.owner)
  ownerId: number;
}
