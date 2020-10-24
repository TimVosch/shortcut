import { ShortcutTokenValue } from './shortcut-token.value';
import { ShortcutEntity } from './shortcut.entity';

export const TOKEN_SERVICE_TOKEN = Symbol.for('TOKEN_SERVICE');

export interface TokenServiceInterface {
  findToken(shortcut: ShortcutEntity): Promise<ShortcutTokenValue | null>;
  createToken(shortcut: ShortcutEntity): Promise<ShortcutTokenValue>;
  deleteToken(shortcut: ShortcutEntity): Promise<void>;
  isValid(token: ShortcutTokenValue): Promise<boolean>;
}
