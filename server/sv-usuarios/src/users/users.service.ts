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

  async register(dto: RegisterDto) {
    const exists = await this.usersRepo.findOneBy({ email: dto.email });
    if (exists) throw new ConflictException('E-mail já cadastrado');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({ ...dto, password: hash });
    const saved = await this.usersRepo.save(user);

    const { password: _pw, ...result } = saved;
    return result;
  }

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

  async findById(id: string) {
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findById(id);
    if (dto.name) user.name = dto.name;
    if (dto.password) user.password = await bcrypt.hash(dto.password, 10);
    const saved = await this.usersRepo.save(user);
    const { password: _pw, ...result } = saved;
    return result;
  }
}
