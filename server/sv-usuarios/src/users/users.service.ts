/**
 * Serviço de negócio de usuários. Trata cadastro (com hash de senha via
 * bcrypt), autenticação (emissão de JWT), consulta e atualização de perfil.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 20/06/2026
 * Atualização: 07/07/2026
 */
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Cadastra um novo usuário, garantindo e-mail único e senha com hash.
   * @param dto Nome, e-mail e senha do novo usuário.
   * @returns Usuário salvo, sem o campo de senha.
   * @throws ConflictException se o e-mail já estiver cadastrado.
   */
  async register(dto: RegisterDto) {
    const exists = await this.usersRepo.findOneBy({ email: dto.email });
    if (exists) throw new ConflictException('E-mail já cadastrado');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({ ...dto, password: hash });
    const saved = await this.usersRepo.save(user);

    const { password: _pw, ...result } = saved;
    return result;
  }

  /**
   * Valida as credenciais e emite um token JWT.
   * @param dto E-mail e senha.
   * @returns Objeto com token e dados do usuário (sem a senha).
   * @throws UnauthorizedException se as credenciais forem inválidas.
   */
  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({
      where: { email: dto.email },
      select: { id: true, name: true, email: true, password: true },
    });

    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    const { password: _pw, ...userData } = user;
    return { token, user: userData };
  }

  /**
   * Busca um usuário pelo id.
   * @param id Id do usuário.
   * @returns O usuário encontrado.
   * @throws NotFoundException se o usuário não existir.
   */
  async findById(id: string) {
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  /**
   * Atualiza nome e/ou senha do usuário (senha re-hasheada quando informada).
   * @param id Id do usuário.
   * @param dto Campos opcionais a atualizar.
   * @returns Usuário atualizado, sem o campo de senha.
   * @throws NotFoundException se o usuário não existir.
   */
  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findById(id);
    if (dto.name) user.name = dto.name;
    if (dto.password) user.password = await bcrypt.hash(dto.password, 10);
    const saved = await this.usersRepo.save(user);
    const { password: _pw, ...result } = saved;
    return result;
  }
}
