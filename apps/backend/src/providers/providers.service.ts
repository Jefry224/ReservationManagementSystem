import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Provider } from './provider.entity';
import { Repository } from 'typeorm';
import { ProviderNotFoundException } from '../common/exceptions/provider-not-found.exception';

@Injectable()
export class ProvidersService implements OnModuleInit {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  async onModuleInit() {
    await this.seedProviders();
  }

  async seedProviders() {
    const count = await this.providerRepository.count();
    if (count === 0) {
      const defaultProviders = [
        { name: 'Dr. John Doe', email: 'john.doe@thrivelab.com' },
        { name: 'Dra. Jane Smith', email: 'jane.smith@thrivelab.com' },
      ];

      const entities = this.providerRepository.create(defaultProviders);
      const saved = await this.providerRepository.save(entities);

      console.log('🌱 Database seeded. Available Providers:');
      saved.forEach((p) => console.log(`- ${p.name}: ID [ ${p.id} ]`));
    } else {
      const providers = await this.providerRepository.find();
      console.log('👥 Available Providers in DB:');
      providers.forEach((p) => console.log(`- ${p.name}: ID [ ${p.id} ]`));
    }
  }

  async findAll() {
    return this.providerRepository.find();
  }

  async findById(id: string): Promise<Provider> {
    const provider = await this.providerRepository.findOne({ where: { id } });
    if (!provider) {
      throw new ProviderNotFoundException(id);
    }
    return provider;
  }
}
