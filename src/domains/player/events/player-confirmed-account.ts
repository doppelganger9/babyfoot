import { PlayerId } from '../player-id';
import { PlayerEvent } from './player-event';

export class PlayerConfirmedAccount extends PlayerEvent {
  constructor(id: PlayerId, public email: string, public token: string) {
    super(undefined, id);
    Object.freeze(this);
  }
}
