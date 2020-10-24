import { ShortcutTokenValue } from './shortcut-token.value';
import { TokenServiceInterface } from './token-service.interface';

export class ShortcutEntity {
  // Name is the identifier and should not be modified
  private readonly name: string;
  // Destination should not change after it has been created
  private readonly destination: string;
  // Created at date cannot change
  private readonly createdAt: Date;

  constructor(name: string, destination: string, createdAt?: Date | string) {
    this.name = name;
    this.destination = destination;

    // Some logic to parse the createdAt date
    switch (typeof createdAt) {
      case 'string':
        this.createdAt = new Date(createdAt);
        break;
      case 'object':
        // Only set and break if instanceof Date
        if (createdAt instanceof Date) {
          this.createdAt = createdAt;
          break;
        }
      default:
        this.createdAt = new Date();
    }
  }

  // ---- Commands ----
  createToken(tokenService: TokenServiceInterface) {
    return tokenService.createToken(this);
  }

  // ---- Queries ----
  getName() {
    return this.name;
  }

  getDestination() {
    return this.destination;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  getToken(tokenService: TokenServiceInterface) {
    return tokenService.findToken(this);
  }

  async isAuthorizedByToken(tokenService: TokenServiceInterface, token: ShortcutTokenValue) {
    return this.name === token.shortcutName && (await tokenService.isValid(token));
  }
}
