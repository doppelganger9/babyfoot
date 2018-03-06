import { expect } from 'chai';

import { EventPublisher, EventsStore } from '.';
import { PlayersRepository } from './infrastructure/player-repository';
import { PlayerRoutes } from './player-routes';

describe('Player Routes', () => {
  let eventsStore: EventsStore;
  let playersRepository: PlayersRepository;
  let eventPublisher: EventPublisher;

  beforeEach(() => {
    eventsStore = new EventsStore();
    playersRepository = new PlayersRepository(eventsStore, new Map<string, any>());
    eventPublisher = new EventPublisher();
  });

  it('should initialize', () => {
    const t = new PlayerRoutes(eventsStore, playersRepository, eventPublisher);
    expect(t).not.to.be.undefined;
  });

});
