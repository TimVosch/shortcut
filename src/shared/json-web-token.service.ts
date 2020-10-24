import { injectable } from 'inversify';
import { ShortcutTokenValue } from '../domain/shortcut/shortcut-token.value';
import { ShortcutEntity } from '../domain/shortcut/shortcut.entity';

// !!!: Outdated alternative shortcut token service

@injectable()
export class JSONWebTokenService {
  getOrCreate(shortcut: ShortcutEntity): Promise<ShortcutTokenValue> {
    throw new Error('Method not implemented.');
  }
  isValid(token: string, shortcut: ShortcutEntity): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
