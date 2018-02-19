import { expect } from 'chai';
import { UnknownPlayerError } from './errors';
import { PlayersRepository, PlayerListItemProjection } from './player-repository';
import { PlayerId } from '../domains/player/player-id';
import { PlayerCreated } from '../domains/player/events';
import { EventsStore } from '.';

describe('Players Repository', () => {
  let eventsStore: EventsStore;
  let repository: PlayersRepository;
  let projections: Map<string, any>;

  const playerId: PlayerId = new PlayerId('PlayerA');
  const fields = new Map<string, any>();

  beforeEach(() => {
    eventsStore = new EventsStore();
    projections = new Map<string, any>();
    repository = new PlayersRepository(eventsStore, projections);
  });

  it('Given no init arguments When new Then return Repository', () => {
    repository = new PlayersRepository(undefined, undefined);
    expect(() => repository.getAllEvents(playerId)).to.throw(UnknownPlayerError);
  });

  it('Given PlayerCreated When getPlayer Then return Player aggregate', () => {
    const playerCreated = new PlayerCreated(playerId, fields, 'confirmationToken');
    eventsStore.store(playerCreated);

    const userPlayer = repository.getPlayer(playerId);

    expect(userPlayer).not.to.be.empty;
  });

  it('Given no events When getPlayer Then throw UnknownPlayerError', () => {
    expect(() => {
      repository.getPlayer(playerId);
    }).to.throw(UnknownPlayerError);
  });

  it('Given huge list of events When getPlayers Then return list of Players (.05ms per Player)', () => {
    const max = 1000;
    for (let i = 0; i < max; i++) {
      repository.save(new PlayerListItemProjection(new PlayerId('Player' + i)));
    }
    const t0 = new Date().getTime();
    const list = repository.getPlayers();
    const t1 = new Date().getTime();
    expect(t1 - t0).to.be.lessThan(100);
    expect(list).not.to.be.undefined;
    expect(list).not.to.be.null;
    expect(list.length).to.equal(max);
    expect(list[0].playerId.id).to.equal('Player0');
    expect(list[1].playerId.id).to.equal('Player1');
    expect(list[2].playerId.id).to.equal('Player2');
    expect(list[3].playerId.id).to.equal('Player3');
    expect(list[4].playerId.id).to.equal('Player4');
  });
});
