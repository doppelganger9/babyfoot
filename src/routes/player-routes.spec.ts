import { beforeEach, describe, expect, it } from 'vitest';

import { EventPublisher, BFEventsStore } from '..';
import { PlayersRepository } from '../infrastructure/player-repository';
import { PlayerRoutes } from './player-routes';

describe('Player Routes', () => {
  let eventsStore: BFEventsStore;
  let playersRepository: PlayersRepository;
  let eventPublisher: EventPublisher;

  beforeEach(() => {
    eventsStore = new BFEventsStore();
    playersRepository = new PlayersRepository(eventsStore, new Map<string, any>());
    eventPublisher = new EventPublisher();
  });

  it('should initialize', () => {
    const t = new PlayerRoutes(eventsStore, playersRepository, eventPublisher);
    expect(t).not.to.be.undefined;
  });
});
