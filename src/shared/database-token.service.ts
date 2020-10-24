import { inject, injectable } from 'inversify';
import { ShortcutTokenRepository } from '../data/shortcut-token.repository';
import { ShortcutTokenValue } from '../domain/shortcut/shortcut-token.value';
import { ShortcutEntity } from '../domain/shortcut/shortcut.entity';
import { TokenServiceInterface } from '../domain/shortcut/token-service.interface';
import { isEqual } from 'lodash';

@injectable()
export class DatabaseTokenService implements TokenServiceInterface {
  @inject(ShortcutTokenRepository)
  protected readonly tokenRepository: ShortcutTokenRepository;

  async findToken(shortcut: ShortcutEntity): Promise<ShortcutTokenValue | null> {
    const token = await this.tokenRepository.find(shortcut.getName());

    if (token !== null) {
      return token;
    }
    return null;
  }

  async createToken(shortcut: ShortcutEntity): Promise<ShortcutTokenValue> {
    let token = new ShortcutTokenValue(shortcut.getName(), this.generateToken());
    token = await this.tokenRepository.create(token);
    return token;
  }

  async deleteToken(shortcut: ShortcutEntity): Promise<void> {
    await this.tokenRepository.delete(shortcut.getName());
  }

  async isValid(token: ShortcutTokenValue): Promise<boolean> {
    const dbToken = await this.tokenRepository.find(token.shortcutName);
    return isEqual(dbToken, token);
  }

  protected nameList = 'abccdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQSTUVWXYZ1234567890';
  protected generateToken(): string {
    const length = 18;
    let name = '';

    for (let i = 0; i < length; i++) {
      let random = Math.random() * this.nameList.length || 0;
      name += this.nameList.charAt(random);
    }

    return name;
  }
}
