import { Controller, Get, Param } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { plainToInstance } from 'class-transformer';
import { ProviderResponseDTO } from './dto/provider-responde.dto';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  findAll() {
    return plainToInstance(
      ProviderResponseDTO,
      this.providersService.findAll(),
      { excludeExtraneousValues: true },
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const provider = await this.providersService.findById(id);
    return plainToInstance(ProviderResponseDTO, provider, {
      excludeExtraneousValues: true,
    });
  }
}
