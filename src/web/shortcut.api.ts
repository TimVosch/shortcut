import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { ShortcutNameAlreadyInUseError } from '../application/errors/shortcut-name-already-in-use.error';
import { ShortcutService } from '../application/shortcut.service';
import { KeyNotFoundError } from '../data/errors/key-not-found.error';
import { ShortcutTokenValue } from '../domain/shortcut/shortcut-token.value';
import { CreateShortcutRequest } from './create-shortcut.request';

@injectable()
export class ShortcutAPI {
  @inject(ShortcutService)
  protected readonly shortcutService: ShortcutService;

  // ---- Initialization ----

  createRouter(): Router {
    const r = Router();

    r.get('/:name', this.takeShortcut.bind(this));
    r.post('/api/shortcuts', this.createShortcut.bind(this));
    r.delete('/api/shortcuts/:name', this.deleteShortcut.bind(this));

    return r;
  }

  createUrl(protocol: string, hostname: string, shortcutName: string): string {
    return `${protocol}://${hostname}/${shortcutName}`;
  }

  createEditUrl(protocol: string, hostname: string, token: ShortcutTokenValue): string {
    return `${protocol}://${hostname}/edit/${token.shortcutName}?key=${token.value}`;
  }

  extractAuthToken(header?: string) {
    if (typeof header !== 'string') {
      return null;
    }

    const parts = header.split(' ');

    if (parts.length < 2) {
      return null;
    }

    return parts[1];
  }

  // ---- Routes ----

  /**
   * Called when a shortcut is visited.
   * This redirects the visitor to the correct destination
   */
  async takeShortcut(req: Request, res: Response) {
    const name = req.params['name'];
    try {
      const shortcut = await this.shortcutService.get(name);
      res.redirect(shortcut.getDestination());
    } catch (e: unknown) {
      if (e instanceof KeyNotFoundError) {
        res.status(404).send({
          message: `No shortcut with name ${name} found`,
        });
      } else {
        throw e;
      }
    }
  }

  /**
   * Called when a new shortcut is created
   */
  async createShortcut(req: Request, res: Response) {
    // Validate body
    const body = plainToClass(CreateShortcutRequest, req.body);
    await validate(body);

    try {
      const shortcut = await this.shortcutService.create(body.destination, body.name);
      const token = await this.shortcutService.getToken(shortcut);

      // Create URLs for the token
      const editURL = this.createEditUrl(req.protocol, req.hostname, token);
      const url = this.createUrl(req.protocol, req.hostname, shortcut.getName());

      res.status(201).send({
        message: `Created shortcut with name ${shortcut.getName()}`,
        data: {
          shortcut: shortcut.getName(),
          edit: editURL,
          URL: url,
        },
      });
    } catch (e: unknown) {
      if (e instanceof ShortcutNameAlreadyInUseError) {
        res.status(400).send({
          message: `A shortcut with the name '${body.name}' already exists`,
        });
      } else {
        throw e;
      }
    }
  }

  /**
   *
   */
  async deleteShortcut(req: Request, res: Response) {
    const shortcutName = req.params['name'];
    const tokenValue = this.extractAuthToken(req.header('Authorization'));

    if (tokenValue === null) {
      res.status(400).send({
        message: 'Missing authentication token',
      });
      return;
    }

    try {
      // Check whether the request is authenticated
      // TODO: would be nice to create some generic authz wrapper \
      // that can be injected with some specific logic through an interface
      const authorized = await this.shortcutService.isAuthorizedByToken(shortcutName, tokenValue);
      if (!authorized) {
        res.status(401).send({
          message: 'Unauthorized',
        });
        return;
      }

      await this.shortcutService.delete(shortcutName);

      res.send({
        message: `Shortcut '${shortcutName}' has been removed`,
      });
    } catch (e) {
      if (e instanceof KeyNotFoundError) {
        res.status(404).send({
          message: `No shortcut with name ${shortcutName} found`,
        });
      } else {
        throw e;
      }
    }
  }
}
