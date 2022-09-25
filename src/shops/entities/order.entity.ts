import { User } from '../../users/entity/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  RelationId,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { Item } from './item.entity';

@Entity()
export class Order extends CoreEntity {
  @Column({ default: `merchant_${Date.now()}`, nullable: false })
  merchantUid: string;

  @Column({ default: 0, nullable: false })
  amount: number;

  @Column({ default: 0, nullable: false })
  cancelAmount: number;

  @Column({ default: 'card', nullable: false })
  payMethod: string;

  @Column({ default: 'unpaid' })
  status: string;

  @ManyToMany((type) => Item , (item) => item.orders)
  @JoinTable()
  items: Item[];

  @ManyToOne((type) => User, (user) => user.orders, {
    onDelete: 'CASCADE',
  })
  owner: User;

  @RelationId((order: Order) => order.owner)
  ownerId: number;
}
