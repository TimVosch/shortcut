import { inject, injectable } from 'inversify';
import { Pool } from 'pg';
import { ShortcutEntity } from '../domain/shortcut/shortcut.entity';
import { TokenServiceInterface, TOKEN_SERVICE_TOKEN } from '../domain/shortcut/token-service.interface';
import { DB_TOKEN } from './database';
import { KeyNotFoundError } from './errors/key-not-found.error';

@injectable()
export class ShortcutRepository {
  @inject(DB_TOKEN)
  private readonly db: Pool;

  @inject(TOKEN_SERVICE_TOKEN)
  protected readonly tokenService: TokenServiceInterface;

  // ---- Commands ----

  /**
   *
   * @param shortcut The shortcut entity
   */
  async save(shortcut: ShortcutEntity): Promise<ShortcutEntity> {
    try {
      const { rows, rowCount } = await this.db.query(
        'INSERT INTO shortcuts(name, destination, created_at) VALUES ($1, $2, $3) RETURNING *',
        [shortcut.getName(), shortcut.getDestination(), shortcut.getCreatedAt().toISOString()],
      );

      if (rowCount < 1) {
        throw new Error(`Database insert failed, no rows inserted`);
      }

      const row = rows[0];
      return new ShortcutEntity(row.name, row.destination, row.created_at);
    } catch (e: any) {
      // TODO: error handling
      throw new Error(`Database error occured while inserting new shortcut: ${e}`);
    }
  }

  /**
   *
   * @param shortcutName The name of the shortcut
   */
  async delete(shortcutName: string): Promise<void> {
    try {
      const shortcut = await this.get(shortcutName);
      await this.db.query('DELETE FROM shortcuts WHERE name = $1', [shortcut.getName()]);

      // Commented because the database cascades the delete to the shortcut_token
      // this.tokenService.deleteToken(shortcut);
    } catch (e: any) {
      // TODO: error handling
      throw new Error(`Database error occured while deleting shortcut: ${e}`);
    }
  }

  // ---- Queries ----

  /**
   * To be implemented
   * @param pagination
   * @param order
   * @param filter
   */
  async list(pagination: any, order: any, filter: any): Promise<ShortcutEntity[]> {
    // TODO:
    return [];
  }

  /**
   *
   * @param shortcutName The name of the shortcut
   */
  async get(shortcutName: string): Promise<ShortcutEntity> {
    const { rowCount, rows } = await this.db.query('SELECT * FROM shortcuts WHERE name = $1', [shortcutName]);

    if (rowCount === 0) {
      throw new KeyNotFoundError(`No shortcut found with name: ${shortcutName}`);
    }

    const row = rows[0];
    return new ShortcutEntity(row.name, row.destination, row.created_at);
  }

  /**
   *
   * @param shortcutName The name of the shortcut
   */
  async exists(shortcutName: string): Promise<boolean> {
    try {
      await this.get(shortcutName);
      return true;
    } catch (e) {
      if (e instanceof KeyNotFoundError) {
        return false;
      }
      throw e;
    }
  }
}
