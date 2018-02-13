import { PlayerId } from '../player-id';
import { PlayerEvent } from './player-event';

export class PlayerDeleted extends PlayerEvent {
  constructor(id: PlayerId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
