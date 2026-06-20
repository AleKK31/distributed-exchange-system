import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PublicacaoStatus {
  DISPONIVEL = 'disponivel',
  NEGOCIANDO = 'negociando',
  TROCADO = 'trocado',
  REMOVIDO = 'removido',
}

@Entity('publicacoes')
export class Publicacao {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column('uuid') usuario_id!: string;

  @Column() item_oferto!: string;

  @Column() item_desejado!: string;

  @Column() categoria!: string;

  @Column({ nullable: true }) descricao?: string;

  @Column({
    type: 'enum',
    enum: PublicacaoStatus,
    default: PublicacaoStatus.DISPONIVEL,
  })
  status!: PublicacaoStatus;

  @CreateDateColumn() created_at!: Date;

  @UpdateDateColumn() updated_at!: Date;
}
