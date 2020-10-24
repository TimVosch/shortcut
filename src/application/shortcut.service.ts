import { inject, injectable } from 'inversify';
import { ShortcutRepository } from '../data/shortcut.repository';
import { ShortcutTokenValue } from '../domain/shortcut/shortcut-token.value';
import { ShortcutEntity } from '../domain/shortcut/shortcut.entity';
import { TokenServiceInterface, TOKEN_SERVICE_TOKEN } from '../domain/shortcut/token-service.interface';
import { GenerateNameError } from './errors/generate-name.error';
import { ShortcutNameAlreadyInUseError } from './errors/shortcut-name-already-in-use.error';

/**
 * Application Layer
 * Infrastructure <-> domain handling
 */
@injectable()
export class ShortcutService {
  @inject(ShortcutRepository)
  protected readonly repository: ShortcutRepository;

  @inject(TOKEN_SERVICE_TOKEN)
  protected readonly tokenService: TokenServiceInterface;

  // ---- Commands ----

  async create(destination: string, _name?: string): Promise<ShortcutEntity> {
    let name: string;

    // Check if name was given, otherwise generate it
    if (typeof _name !== 'string') {
      name = await this.generateName();
    } else {
      name = _name;

      // The name chosen by the creator should not be in use
      if (await this.repository.exists(name)) {
        throw new ShortcutNameAlreadyInUseError(`A shortcut with the name ${name} already exists`);
      }
    }

    let shortcut = new ShortcutEntity(name, destination);
    shortcut = await this.repository.save(shortcut);

    return shortcut;
  }

  async delete(name: string): Promise<void> {
    await this.get(name);
    await this.repository.delete(name);
  }

  // ---- Queries ----

  async getToken(shortcut: ShortcutEntity): Promise<ShortcutTokenValue> {
    // getToken returns a ShortcutTokenValue object, we only need the token
    let tokenValue = await shortcut.getToken(this.tokenService);
    if (tokenValue === null) {
      tokenValue = await shortcut.createToken(this.tokenService);
    }

    return tokenValue;
  }

  async get(name: string): Promise<ShortcutEntity> {
    return await this.repository.get(name);
  }

  async listNew(): Promise<ShortcutEntity[]> {
    return await this.repository.list({}, {}, {});
  }

  async isAuthorizedByToken(name: string, tokenValue: string) {
    const token = new ShortcutTokenValue(name, tokenValue);
    const shortcut = await this.get(name);
    return shortcut.isAuthorizedByToken(this.tokenService, token);
  }

  // ---- Helper functions ----

  protected nameList = 'abccdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQSTUVWXYZ1234567890';
  protected async generateName(): Promise<string> {
    const length = 6;
    let retries = 5;
    let name;

    // Random names can still be duplicate names,
    // that's why we loop until we find one that isn't
    // To avoid infinite looping, we add a retry limit
    do {
      // Check retries
      if (--retries === 0) {
        throw new GenerateNameError(`Error generating name, too many duplicates`);
      }

      name = '';
      for (let i = 0; i < length; i++) {
        let random = Math.random() * this.nameList.length || 0;
        name += this.nameList.charAt(random);
      }
    } while (await this.repository.exists(name));

    return name;
  }
}
