import { Response, Application, Request, Router } from 'express';
import {
  EventsStore,
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
} from '.';
import { GamesRepository } from './infrastructure/game-repository';
import { GameListItemProjection } from './domains/game/game-list-item-projection';
import { GameHandler } from './domains/game/game-handler';
import { Player, TeamColors } from './domains/game/game-id';

export class Routes {
  private eventsStore: EventsStore;
  private userIdentitiesRepository: UserIdentityRepository;
  private sessionsRepository: SessionsRepository;
  private gamesRepository: GamesRepository;
  private eventPublisher: EventPublisher;

  constructor() {
    this.eventsStore = new EventsStore();
    this.userIdentitiesRepository = new UserIdentityRepository(this.eventsStore);
    this.sessionsRepository = new SessionsRepository(this.eventsStore);
    this.gamesRepository = new GamesRepository(this.eventsStore);
    this.eventPublisher = this.createEventPublisher(this.eventsStore);
  }

  public registerRoutes(router: Router): void {
    router.post('/api/identity/userIdentities/register', (req, res) => this.registerUser(req, res));
    router.post('/api/identity/userIdentities/:id/logIn', (req, res) => this.logInUser(req, res));
    router.delete('/api/identity/sessions/:id', (req, res) => this.logOutUser(req, res));

    router.post('/api/games', (req, res) => this.createGame(req, res));
    router.get('/api/games', (req, res) => this.getGameList(req, res));
    router.get('/api/games/:id', (req, res) => this.getGame(req, res));
    router.post('/api/games/:id/start', (req, res) => this.startGame(req, res));
    router.post('/api/games/:id/end', (req, res) => this.endGame(req, res));

    router.get('/api/games/:id/players', (req, res) => this.getPlayersInGame(req, res));
    router.post('/api/games/:id/players/:player/:team', (req, res) => this.addPlayerToGame(req, res));
    router.delete('/api/games/:id/players/:player', (req, res) => this.removePlayerFromGame(req, res));
    router.post('/api/games/:id/goals/:player', (req, res) => this.addGoalFromPlayerToGame(req, res));
    router.post('/api/games/:id/players/:player/position/:position', (req, res) =>
      this.changeUserPositionToGame(req, res),
    );

    // router.get('/api/games/:id/comments', getCommentsOnGame);
    // router.post('/api/games/:id/comments', addCommentToGame);
    // router.post('/api/games/:id/comments/:commentId', changeCommentOnGame);
    // router.delete('/api/games/:id/comments/:commentId', removeCommentOnGame);

    // router.get('/api/games/:id/reviews', getReviewsOnGame);
    // router.post('/api/games/:id/reviews', addReviewOnGame);
    // router.post('/api/games/:id/reviews/:reviewId', updateReviewOnGame);
    // router.delete('/api/games/:id/reviews/:reviewId', removeReviewOnGame);
  }

  private createEventPublisher(eventsStore: EventsStore) {
    const eventPublisher = new EventPublisher();

    // this will Store all events in the events' Store
    eventPublisher.onAny(eventsStore.store);
    // all repositories are injected with the eventsStore, and thus will benefit from the above line.

    // this will also publish events for side-effects, that is, other projections listening on diverse events.
    // Here, Session and Timeline Update projections:
    new SessionHandler(this.sessionsRepository).register(eventPublisher);
    new GameHandler(this.gamesRepository).register(eventPublisher);

    // Later on, for the QUERY part of CQRS, you just need to query the routerropriate repository which
    // contains ready - to - use and up - to - date projections

    return eventPublisher;
  }

  private registerUser(req: Request, res: Response) {
    // parse request body attributes
    const email: string = req.body.email;

    // call COMMAND on Aggregate (this time it is a static method)
    UserIdentity.register(this.eventPublisher, email);

    // send response
    res.status(201).send({
      id: new UserId(email),
      logIn: `/api/identity/userIdentities/${encodeURIComponent(email)}/logIn`,
      url: '/api/identity/userIdentities/' + encodeURIComponent(email),
    });
  }

  private logInUser(req: Request, res: Response) {
    // create ID value type based on request parameters
    const userId = new UserId(req.params.id);
    // find Aggregate for this ID in repository
    const userIdentity = this.userIdentitiesRepository.getUserIdentity(userId);
    // call COMMAND on Aggregate
    const sessionId = userIdentity.logIn(this.eventPublisher);

    res.status(201).send({
      id: sessionId,
      url: '/api/identity/sessions/' + encodeURIComponent(sessionId.id),
    });
  }

  private logOutUser(req: Request, res: Response) {
    const sessionId = new SessionId(req.params.id);

    // QUERY to retrieve Aggregate
    const session = this.sessionsRepository.getSession(sessionId);

    // COMMAND
    session.logOut(this.eventPublisher);

    res.status(200).send('User disconnected');
  }

  //// GAME /////

  private createGame(req: Request, res: Response) {
    const id = generateUUID();
    // call COMMAND on Aggregate (this time it is a static method, because the Entity does not yet exist)
    Game.createGame(this.eventPublisher, id);

    // send response
    res.status(201).send({
      gameId: new GameId(id),
      // TODO: the HATEOAS links should be generated in some way given the state of the Game. Maybe it is a new ActionsOnGameProjection ?
      end: `/api/games/${encodeURIComponent(id)}/end`,
      start: `/api/games/${encodeURIComponent(id)}/start`,
      url: '/api/games/' + encodeURIComponent(id),
    });
  }

  private getGame(req: Request, res: Response) {
    // create ID value type based on request parameters
    const gameId = new GameId(req.params.id);

    // call COMMAND on Aggregate (this time it is a static method, because the Entity does not yet exist)
    const found: Game = this.gamesRepository.getGame(gameId);

    // send response
    this.standardGameOKResponseWithAddedAttributes(res, gameId, {
      currentEndDatetime: found.projection.currentEndDatetime,
      currentStartDatetime: found.projection.currentStartDatetime,
      duration: found.projection.duration,
      initialDatetime: found.projection.initialDatetime,
      isDeleted: found.projection.isDeleted,
      players: found.projection.players,
      pointsTeamBlue: found.projection.pointsTeamBlue,
      pointsTeamRed: found.projection.pointsTeamRed,
      teamBlueMembers: found.projection.teamBlueMembers,
      teamRedMembers: found.projection.teamRedMembers,
      winner: found.projection.winner,

      end: `/api/games/${encodeURIComponent(gameId.id)}/end`,
      start: `/api/games/${encodeURIComponent(gameId.id)}/start`,
    });
  }

  private getGameList(req: Request, res: Response) {
    // TODO : add _embedded option? (will be 1000 times slower)

    const all: Array<GameListItemProjection> = this.gamesRepository.getGames();

    // send response
    res.status(200).send({
      list: all.map(game => {
        return {
          created: game.timestamp,
          gameId: game.gameId,

          url: '/api/games/' + encodeURIComponent(game.gameId.id),
        };
      }),
      url: '/api/games',
    });
  }

  private startGame(req: Request, res: Response) {
    const now = new Date();
    // create ID value type based on request parameters
    const gameId = new GameId(req.params.id);
    // find Aggregate for this ID in repository
    const game = this.gamesRepository.getGame(gameId);
    // call COMMAND on Aggregate
    game.startGame(this.eventPublisher);

    this.standardGameOKResponseWithAddedAttributes(res, gameId, {
      end: `/api/games/${encodeURIComponent(gameId.id)}/end`,
      time: now,
    });
  }

  private endGame(req: Request, res: Response) {
    const now = new Date();
    // create ID value type based on request parameters
    const gameId = new GameId(req.params.id);
    // find Aggregate for this ID in repository
    const game = this.gamesRepository.getGame(gameId);
    // call COMMAND on Aggregate
    game.endGame(this.eventPublisher);

    this.standardGameOKResponseWithAddedAttributes(res, gameId, { time: now });
  }

  private addGoalFromPlayerToGame(req: Request, res: Response) {
    const gameId = new GameId(req.params.id);
    const player: Player = req.params.player;

    // find Aggregate for this ID in repository
    const game = this.gamesRepository.getGame(gameId);

    // call COMMAND on Aggregate
    game.addGoalFromPlayer(this.eventPublisher, player);

    this.standardGameOKResponseWithAddedAttributes(res, gameId, { player });
  }

  private getPlayersInGame(req: Request, res: Response) {
    const gameId = new GameId(req.params.id);

    // find Aggregate for this ID in repository
    const found = this.gamesRepository.getGame(gameId);

    this.standardGameOKResponseWithAddedAttributes(
      res,
      gameId,
      {
        players: found.projection.players,
        pointsTeamBlue: found.projection.pointsTeamBlue,
        pointsTeamRed: found.projection.pointsTeamRed,
        teamBlueMembers: found.projection.teamBlueMembers,
        teamRedMembers: found.projection.teamRedMembers,
        winner: found.projection.winner,
      },
      '/players',
    );
  }

  private addPlayerToGame(req: Request, res: Response) {
    const gameId = new GameId(req.params.id);
    const player: Player = req.params.player;
    const team: TeamColors = req.params.team;

    // find Aggregate for this ID in repository
    const found = this.gamesRepository.getGame(gameId);

    // call COMMAND on Aggregate
    found.addPlayerToGame(this.eventPublisher, player, team);

    this.standardGameOKResponseWithAddedAttributes(res, gameId, { player, team }, '/players');
  }

  private removePlayerFromGame(req: Request, res: Response) {
    const gameId = new GameId(req.params.id);
    const player: Player = req.params.player;

    // find Aggregate for this ID in repository
    const found = this.gamesRepository.getGame(gameId);

    // call COMMAND on Aggregate
    found.removePlayerFromGame(this.eventPublisher, player);

    this.standardGameOKResponseWithAddedAttributes(res, gameId, { player }, '/players');
  }

  private changeUserPositionToGame(req: Request, res: Response) {
    const gameId = new GameId(req.params.id);
    const player: Player = req.params.player;
    const position: PositionValue = req.params.position;

    // find Aggregate for this ID in repository
    const found = this.gamesRepository.getGame(gameId);

    // call COMMAND on Aggregate
    found.changeUserPositionOnGame(this.eventPublisher, player, position);

    this.standardGameOKResponseWithAddedAttributes(res, gameId, {
      player,
      position,
    });
  }

  private standardGameOKResponseWithAddedAttributes(
    res: Response,
    gameId: GameId,
    addThisToTheBody: any = {},
    context: string = '',
  ): void {
    res.status(200).send({
      gameId,
      ...addThisToTheBody, // destructuring FTW! \o/
      url: `/api/games/${encodeURIComponent(gameId.id)}${context}`,
    });
  }
}
