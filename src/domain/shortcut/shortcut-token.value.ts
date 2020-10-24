import { ShortcutEntity } from './shortcut.entity';

export class ShortcutTokenValue {
  // This referes to the type that the 'name' property on ShortcutEntity uses
  readonly shortcutName: ShortcutEntity['name'];
  readonly value: string;

  constructor(shortcutName: string, value: string) {
    this.shortcutName = shortcutName;
    this.value = value;
  }
}
