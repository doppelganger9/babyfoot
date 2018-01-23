import { expect } from 'chai';
import { GamesRepository, EventsStore, GameCreated, UnknownGame } from '../index';
import { Game, GameId } from '../domains/game/game';

describe('Games Repository', function() {

  let eventsStore: EventsStore;
  let repository: GamesRepository;

  const gameId: GameId = new GameId('GameA');

  beforeEach(function() {
    eventsStore = new EventsStore();
    repository = new GamesRepository(eventsStore);
  });

  it('Given GameCreated When getGame Then return Game aggregate', function() {
    const gameCreated = new GameCreated(gameId);
    eventsStore.store(gameCreated);

    var userGame = repository.getGame(gameId);

    expect(userGame).not.to.empty;
  });

  it('Given no events When getGame Then throw UnknownGame', function() {
    expect(function() {
      repository.getGame(gameId);
    }).to.throw(UnknownGame);
  });
});
