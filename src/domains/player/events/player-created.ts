import { PlayerId } from '../player-id';
import { PlayerEvent } from './player-event';

export class PlayerCreated extends PlayerEvent {
  constructor(id: PlayerId, public fields: Map<string, any>, public confirmationToken: string) {
    super(undefined, id);
    Object.freeze(this);
  }
}
