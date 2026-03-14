import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { MetricType } from '@modules/metric/enums/metric-type.enum';
import { MetricUnit } from '@modules/metric/enums/metric-unit.enum';

@Entity('metric_entries')
export class MetricEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  userId: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  value: number;

  @Column({ type: 'varchar', length: 50 })
  unit: MetricUnit;

  @Column({ type: 'varchar', length: 50 })
  type: MetricType;

  @CreateDateColumn()
  createdAt: Date;
}
