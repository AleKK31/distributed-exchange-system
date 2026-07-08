/**
 * Entidade Proposta (tabela propostas) e enums de resposta/status. Representa
 * uma proposta de troca entre duas publicações, guardando a resposta de cada
 * usuário e o status geral (pendente/aceito/recusado/expirado/cancelado).
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 21/06/2026
 * Atualização: 07/07/2026
 */
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RespostaStatus {
  PENDENTE = 'pendente',
  ACEITO = 'aceito',
  RECUSADO = 'recusado',
}

export enum PropostaStatus {
  PENDENTE = 'pendente',
  ACEITO = 'aceito',
  RECUSADO = 'recusado',
  EXPIRADO = 'expirado',
  CANCELADO = 'cancelado',
}

@Entity('propostas')
export class Proposta {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column('uuid') publicacao_a_id!: string;

  @Column('uuid') publicacao_b_id!: string;

  @Column('uuid') usuario_a_id!: string;

  @Column('uuid') usuario_b_id!: string;

  @Column({
    type: 'enum',
    enum: RespostaStatus,
    default: RespostaStatus.PENDENTE,
  })
  resposta_a!: RespostaStatus;

  @Column({
    type: 'enum',
    enum: RespostaStatus,
    default: RespostaStatus.PENDENTE,
  })
  resposta_b!: RespostaStatus;

  @Column({
    type: 'enum',
    enum: PropostaStatus,
    default: PropostaStatus.PENDENTE,
  })
  status!: PropostaStatus;

  @CreateDateColumn() created_at!: Date;

  @UpdateDateColumn() updated_at!: Date;
}
