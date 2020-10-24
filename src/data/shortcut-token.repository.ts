import { inject, injectable } from 'inversify';
import { Pool } from 'pg';
import { ShortcutTokenValue } from '../domain/shortcut/shortcut-token.value';
import { DB_TOKEN } from './database';

@injectable()
export class ShortcutTokenRepository {
  @inject(DB_TOKEN)
  protected readonly db: Pool;

  /**
   * Tries to find a shortcut by its name
   * Note that find can return null and won't throw if nothing
   * is found, as opposed to 'get'
   * @param name The name of the shortcut
   */
  async find(shortcutName: string): Promise<ShortcutTokenValue | null> {
    try {
      const { rows, rowCount } = await this.db.query('SELECT * FROM shortcut_tokens WHERE shortcut_name = $1', [shortcutName]);

      if (rowCount < 1) {
        return null;
      }

      const row = rows[0];
      return new ShortcutTokenValue(row.shortcut_name, row.token);
    } catch (e) {
      throw new Error(`A database error occured while fetching shortcut token: ${e}`);
    }
  }

  /**
   *
   * @param token The shortcut token
   */
  async create(token: ShortcutTokenValue): Promise<ShortcutTokenValue> {
    const { shortcutName, value: tokenValue } = token;
    try {
      const { rows, rowCount } = await this.db.query('INSERT INTO shortcut_tokens(shortcut_name, token) VALUES ($1, $2) RETURNING *', [
        shortcutName,
        tokenValue,
      ]);

      if (rowCount < 1) {
        throw new Error(`No row was inserted`);
      }

      return new ShortcutTokenValue(rows[0].shortcut_name, rows[0].token);
    } catch (e) {
      throw new Error(`A database error occured while inserting shortcut token: ${e}`);
    }
  }

  /**
   *
   * @param shortcutName The name of the shortcut
   */
  async delete(shortcutName: string) {
    try {
      await this.db.query('DELETE FROM shortcut_tokens WHERE shortcut_name = $1', [shortcutName]);
    } catch (e) {
      throw new Error(`A database error occured while deleting shortcut token: ${e}`);
    }
  }
}
