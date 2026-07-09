import { Expose } from 'class-transformer';

export class ProviderResponseDTO {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;
}
