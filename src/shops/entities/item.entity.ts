import { Order } from './order.entity';
import { User } from '../../users/entity/user.entity';
import { CoreEntity } from '../../common/entities/core.entity';
import { Entity, Column, ManyToOne, RelationId, ManyToMany } from 'typeorm';

@Entity()
export class Item extends CoreEntity {
  @Column()
  name: string;

  @Column()
  amount: number;

  @Column()
  itemImgSize: number;

  @Column()
  itemImgName: string;

  @Column()
  itemImgPath: string;

  @Column()
  content: string;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  rating: number;

  @ManyToMany(() => Order, (order) => order.items)
  orders: Order[];

  @ManyToOne((type) => User, (user) => user.items, {
    onDelete: 'CASCADE',
  })
  owner: User;

  @RelationId((item: Item) => item.owner)
  ownerId: number;
}
