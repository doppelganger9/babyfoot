import { BFEvent, BFEventsStore } from '..';
import { Player } from '../domains/player';
import { PlayerId } from '../domains/player';
import { UnknownPlayerError } from '../domains';

export class PlayerListItemProjection {
  public displayName: string;
  public avatar: string;
  public isDeleted: boolean;
  public email: string;
  constructor(public playerId: PlayerId) {
    this.displayName = '';
    this.avatar = '';
    this.isDeleted = false;
    this.email = '';
  }
}

/**
 * This class stores all Player projections.
 * It basically recreates Aggregates from the stores events in the delegate BFEventsStore by filtering by ID.
 * It can also store other projections in a Map, with methods to access these simple projections.
 */
export class PlayersRepository {
  constructor(
    private eventsStore: BFEventsStore = new BFEventsStore(),
    private projections: Map<string, any> = new Map<string, any>(),
  ) {
    this.projections.set('list', new Array<PlayerListItemProjection>());
  }

  /**
   * returns all events for a given PlayerId.
   * @param PlayerId filter
   */
  public getAllEvents(playerId: PlayerId): Array<BFEvent> {
    const events: Array<BFEvent> = this.eventsStore.getEventsOfAggregate(playerId);
    if (!events.length) {
      throw new UnknownPlayerError(playerId);
    }

    return events;
  }

  public save(projection: PlayerListItemProjection): void {
    const list: Array<PlayerListItemProjection> = this.projections.get('list');
    if (list.filter(e => e.playerId.id === projection.playerId.id).length > 0) {
      // update
      const filteredList = list.filter(e => e.playerId.id !== projection.playerId.id);
      filteredList.push(projection);
      this.projections.set('list', filteredList);
    } else {
      // add
      list.push(projection);
      this.projections.set('list', list);
    }
  }

  /**
   * returns the Player Aggregate for the given id.
   * The Player Aggregate is created from events (event sourcing).
   * @param PlayerId filter
   */
  public getPlayer(playerId: PlayerId): Player {
    const events: Array<BFEvent> = this.getAllEvents(playerId);
    return new Player(events);
  }

  /**
   * returns all the Player Aggregates.
   * The Player Aggregate list is created from all events (event sourcing).
   */
  public getPlayers(): Array<PlayerListItemProjection> {
    return this.projections.get('list');
  }

  public getPlayerFromList(playerId: PlayerId): PlayerListItemProjection {
    return this.projections
      .get('list')
      .filter((x: PlayerListItemProjection) => x.playerId.id === playerId.id)
      .pop();
  }
}
