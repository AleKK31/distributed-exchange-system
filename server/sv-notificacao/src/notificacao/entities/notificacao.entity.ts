import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum TipoNotificacao {
  ENCONTRADO = 'match.encontrado',
  ACEITO = 'match.aceito',
  RECUSADO = 'match.recusado',
  EXPIRADO = 'match.expirado',
  CANCELADO = 'match.cancelado',
}

@Entity('notificacoes')
export class Notificacao {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column('uuid') usuario_id!: string;

  @Column({ type: 'enum', enum: TipoNotificacao })
  tipo!: TipoNotificacao;

  @Column('uuid') match_id!: string;

  @Column('uuid') publicacao_a_id!: string;

  @Column('uuid') publicacao_b_id!: string;

  @Column('text') mensagem!: string;

  @Column({ default: false }) lida!: boolean;

  @CreateDateColumn() created_at!: Date;
}
