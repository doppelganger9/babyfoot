import { Response, Application, Request, Router } from 'express';
import {
  BFEventsStore,
  UserId,
  SessionsRepository,
  SessionId,
  UserIdentity,
  SessionHandler,
  UserIdentityRepository,
  EventPublisher,
  Game,
  generateUUID,
  GameId,
  PositionValue,
} from '..';
import { GamesRepository } from '../infrastructure/game-repository';
import { PlayersRepository } from '../infrastructure/player-repository';
import { GameListItemProjection } from '../domains/game/game-list-item-projection';
import { GameHandler } from '../domains/game/game-handler';
import { TeamColors } from '../domains/game/game-id';
import { PlayerId } from '../domains/player';
import { PlayerHandler } from '../domains/player/player-handler';
import { UptimeRoutes } from './uptime-routes';
import { GamesRoutes } from './games-routes';
import { PlayerRoutes } from './player-routes';
import { IdentityRoutes } from './identity-routes';

export class Routes {
  private eventsStore: BFEventsStore;
  private userIdentitiesRepository: UserIdentityRepository;
  private sessionsRepository: SessionsRepository;
  private gamesRepository: GamesRepository;
  private playersRepository: PlayersRepository;
  private eventPublisher: EventPublisher;

  private uptimeRoutes: UptimeRoutes;
  private playerRoutes: PlayerRoutes;
  private gamesRoutes: GamesRoutes;
  private identityRoutes: IdentityRoutes;

  constructor() {
    this.eventsStore = new BFEventsStore();
    this.userIdentitiesRepository = new UserIdentityRepository(this.eventsStore);
    this.sessionsRepository = new SessionsRepository(this.eventsStore);
    this.gamesRepository = new GamesRepository(this.eventsStore);
    this.playersRepository = new PlayersRepository(this.eventsStore);
    this.eventPublisher = this.createEventPublisher(this.eventsStore);

    this.identityRoutes = new IdentityRoutes(
      this.eventsStore,
      this.userIdentitiesRepository,
      this.sessionsRepository,
      this.eventPublisher,
    );
    this.playerRoutes = new PlayerRoutes(this.eventsStore, this.playersRepository, this.eventPublisher);
    this.gamesRoutes = new GamesRoutes(
      this.eventsStore,
      this.gamesRepository,
      this.playersRepository,
      this.eventPublisher,
    );
    this.uptimeRoutes = new UptimeRoutes();
  }

  public registerRoutes(router: Router): void {
    this.uptimeRoutes.registerRoutes(router);
    this.identityRoutes.registerRoutes(router);
    this.gamesRoutes.registerRoutes(router);
    this.playerRoutes.registerRoutes(router);
  }

  private createEventPublisher(eventsStore: BFEventsStore) {
    const eventPublisher = new EventPublisher();

    // this will Store all events in the events' Store
    eventPublisher.onAny(eventsStore.store);
    // all repositories are injected with the eventsStore, and thus will benefit from the above line.

    // this will also publish events for side-effects, that is, other projections listening on diverse events.
    // Here, Session and Timeline Update projections:
    new SessionHandler(this.sessionsRepository).register(eventPublisher);
    new GameHandler(this.gamesRepository).register(eventPublisher);
    new PlayerHandler(this.playersRepository).register(eventPublisher);

    // Later on, for the QUERY part of CQRS, you just need to query the routerropriate repository which
    // contains ready - to - use and up - to - date projections

    return eventPublisher;
  }
}
