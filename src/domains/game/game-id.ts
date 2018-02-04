import { ValueType } from '../../value-type';

export type PositionValue = 'goal' | 'defenseurs' | 'demis' | 'attaquants';
export type TeamColors = 'red' | 'blue';
export type Player = string;

export class GameId extends ValueType {
  constructor(public id: string) {
    super();
  }

  public toString(): string {
    return 'Game:' + this.id;
  }
}
