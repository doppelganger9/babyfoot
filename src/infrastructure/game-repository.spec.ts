import { expect } from 'chai';
import { GamesRepository, EventsStore, GameCreated, UnknownGame, GameStarted, GameEnded } from '../index';
import { Game, GameId } from '../domains/game/game';
import { GameListItemProjection } from '../domains/game/game-list-item-projection';

describe('Games Repository', () => {

  let eventsStore: EventsStore;
  let repository: GamesRepository;
  let projections: Map<string, any>;

  const gameId: GameId = new GameId('GameA');

  beforeEach(() => {
    eventsStore = new EventsStore();
    projections = new Map<string, any>();
    repository = new GamesRepository(eventsStore, projections);
  });

  it('Given GameCreated When getGame Then return Game aggregate', () => {
    const gameCreated = new GameCreated(gameId);
    eventsStore.store(gameCreated);

    var userGame = repository.getGame(gameId);

    expect(userGame).not.to.empty;
  });

  it('Given no events When getGame Then throw UnknownGame', () => {
    expect(() => {
      repository.getGame(gameId);
    }).to.throw(UnknownGame);
  });

  it('Given huge list of events When getGames Then return list of games (.001ms per Game)', () => {
    const max = 50000;
    for (let i = 0; i < max; i++) {
      repository.save(new GameListItemProjection(new GameId('Game'+i), new Date()));
    }
    const t0 = new Date().getTime();
    const list = repository.getGames();
    const t1 = new Date().getTime();
    expect(t1 - t0).to.be.lessThan(100);
    expect(list).not.to.be.undefined;
    expect(list).not.to.be.null;
    expect(list.length).to.equal(max);
    expect(list[0].gameId.id).to.equal('Game0');
    expect(list[1].gameId.id).to.equal('Game1');
    expect(list[2].gameId.id).to.equal('Game2');
    expect(list[3].gameId.id).to.equal('Game3');
    expect(list[4].gameId.id).to.equal('Game4');
  });

});
