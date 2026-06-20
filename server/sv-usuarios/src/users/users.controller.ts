import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Cadastra novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado' })
  async register(@Body() dto: RegisterDto) {
    const data = await this.usersService.register(dto);
    return { status: 201, message: 'Usuário criado com sucesso', data };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Autentica usuário e retorna JWT' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() dto: LoginDto) {
    const result = await this.usersService.login(dto);
    return { status: 200, message: 'Login realizado com sucesso', ...result };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna perfil do usuário autenticado' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401, description: 'Token inválido ou ausente' })
  async getMe(@Request() req: { user: { id: string } }) {
    const data = await this.usersService.findById(req.user.id);
    return { status: 200, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna perfil público de um usuário' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return { status: 200, data: { id: user.id, name: user.name } };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza perfil do usuário autenticado' })
  @ApiResponse({ status: 200 })
  async updateMe(
    @Request() req: { user: { id: string } },
    @Body() dto: UpdateUserDto,
  ) {
    const data = await this.usersService.update(req.user.id, dto);
    return { status: 200, data };
  }
}
