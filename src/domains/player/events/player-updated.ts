import { PlayerId } from '../player-id';
import { PlayerEvent } from './player-event';

export class PlayerUpdated extends PlayerEvent {
  constructor(id: PlayerId, public fields: Map<string, any>) {
    super(undefined, id);
    Object.freeze(this);
  }
}
