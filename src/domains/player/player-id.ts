import { ValueType } from '../..';

export class PlayerId extends ValueType {
  public static listIncludesId(list: Array<PlayerId>, element: PlayerId): boolean {
    return list.filter(x => x.id === element.id).length > 0;
  }
  constructor(public id: string) {
    super();
  }
  public toString(): string {
    return 'Player:' + this.id;
  }
}
