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
import { GameListItemProjection } from '../domains/game/game-list-item-projection';
import { GameHandler } from '../domains/game/game-handler';
import { TeamColors } from '../domains/game/game-id';
import { PlayerId } from '../domains/player';
import { PlayerHandler } from '../domains/player/player-handler';
import { Player } from '../domains/player';
import { PlayersRepository } from '../infrastructure/player-repository';
import { checkFirebaseAuthToken } from '../security';

export class GamesRoutes {
  constructor(
    public eventsStore: BFEventsStore,
    public gamesRepository: GamesRepository,
    public playersRepository: PlayersRepository,
    public eventPublisher: EventPublisher,
  ) {}

  public registerRoutes(router: Router): void {
    router.post('/api/games', checkFirebaseAuthToken, (req, res) => this.createGame(req, res));
    router.get('/api/games', checkFirebaseAuthToken, (req, res) => this.getGameList(req, res));
    router.get('/api/games/:id', checkFirebaseAuthToken, (req, res) => this.getGame(req, res));
    router.delete('/api/games/:id', checkFirebaseAuthToken, (req, res) => this.deleteGame(req, res));
    router.post('/api/games/:id/start', checkFirebaseAuthToken, (req, res) => this.startGame(req, res));
    router.post('/api/games/:id/end', checkFirebaseAuthToken, (req, res) => this.endGame(req, res));
    router.post('/api/games/:id', checkFirebaseAuthToken, (req, res) => this.updateGame(req, res));

    router.get('/api/games/:id/players', checkFirebaseAuthToken, (req, res) => this.getPlayersInGame(req, res));
    router.post('/api/games/:id/players/:player/:team', checkFirebaseAuthToken, (req, res) => this.addPlayerToGame(req, res));
    router.delete('/api/games/:id/players/:player', checkFirebaseAuthToken, (req, res) => this.removePlayerFromGame(req, res));
    router.post('/api/games/:id/goals/:player', checkFirebaseAuthToken, (req, res) => this.addGoalFromPlayerToGame(req, res));
    router.post('/api/games/:id/players/:player/position/:position', checkFirebaseAuthToken, (req, res) =>
      this.changeUserPositionToGame(req, res),
    );

    // router.get('/api/games/:id/comments', checkFirebaseAuthToken, getCommentsOnGame);
    // router.post('/api/games/:id/comments', checkFirebaseAuthToken, addCommentToGame);
    // router.post('/api/games/:id/comments/:commentId', checkFirebaseAuthToken, changeCommentOnGame);
    // router.delete('/api/games/:id/comments/:commentId', checkFirebaseAuthToken, removeCommentOnGame);

    // router.get('/api/games/:id/reviews', checkFirebaseAuthToken, getReviewsOnGame);
    // router.post('/api/games/:id/reviews', checkFirebaseAuthToken, addReviewOnGame);
    // router.post('/api/games/:id/reviews/:reviewId', checkFirebaseAuthToken, updateReviewOnGame);
    // router.delete('/api/games/:id/reviews/:reviewId', checkFirebaseAuthToken, removeReviewOnGame);
  }

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
    const embedded = req.query._embedded;

    // call COMMAND on Aggregate (this time it is a static method, because the Entity does not yet exist)
    const found: Game = this.gamesRepository.getGame(gameId);
    const embedPlayers = embedded
      ? (list: Array<PlayerId>) => list.map(it => this.playersRepository.getPlayerFromList(it))
      : (list: Array<PlayerId>) => list;
    // send response
    this.standardGameOKResponseWithAddedAttributes(res, gameId, {
      currentEndDatetime: found.projection.currentEndDatetime,
      currentStartDatetime: found.projection.currentStartDatetime,
      duration: found.projection.duration,
      initialDatetime: found.projection.initialDatetime,
      isDeleted: found.projection.isDeleted,
      players: embedPlayers(found.projection.players),
      pointsTeamBlue: found.projection.pointsTeamBlue,
      pointsTeamRed: found.projection.pointsTeamRed,
      teamBlueMembers: embedPlayers(found.projection.teamBlueMembers),
      teamRedMembers: embedPlayers(found.projection.teamRedMembers),
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

  private updateGame(req: Request, res: Response) {
    // create ID value type based on request parameters
    const gameId = new GameId(req.params.id);
    const initialDatetime = req.body.initialDatetime;
    // find Aggregate for this ID in repository
    const game = this.gamesRepository.getGame(gameId);
    // call COMMAND on Aggregate
    game.updateInitialDateTime(this.eventPublisher, initialDatetime);

    // API User should make a GET after this. This endpoint does not send the updated Game projection.
    this.standardGameOKResponseWithAddedAttributes(res, gameId, {
      end: `/api/games/${encodeURIComponent(gameId.id)}/end`,
      start: `/api/games/${encodeURIComponent(gameId.id)}/start`,
    });
  }

  private deleteGame(req: Request, res: Response) {
    const gameId = new GameId(req.params.id);
    const game = this.gamesRepository.getGame(gameId);
    game.deleteGame(this.eventPublisher);
    this.standardGameOKResponseWithAddedAttributes(res, gameId);
  }

  private addGoalFromPlayerToGame(req: Request, res: Response) {
    const gameId = new GameId(req.params.id);
    const playerId = new PlayerId(req.params.player);

    // find Aggregate for this ID in repository
    const game = this.gamesRepository.getGame(gameId);

    // call COMMAND on Aggregate
    game.addGoalFromPlayer(this.eventPublisher, playerId);

    this.standardGameOKResponseWithAddedAttributes(res, gameId, { playerId });
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
    const playerId = new PlayerId(req.params.player);
    const team: TeamColors = req.params.team as TeamColors;

    // find Aggregate for this ID in repository
    const found = this.gamesRepository.getGame(gameId);

    // call COMMAND on Aggregate
    found.addPlayerToGame(this.eventPublisher, playerId, team);

    this.standardGameOKResponseWithAddedAttributes(res, gameId, { playerId, team }, '/players');
  }

  private removePlayerFromGame(req: Request, res: Response) {
    const gameId = new GameId(req.params.id);
    const playerId = new PlayerId(req.params.player);

    // find Aggregate for this ID in repository
    const found = this.gamesRepository.getGame(gameId);

    // call COMMAND on Aggregate
    found.removePlayerFromGame(this.eventPublisher, playerId);

    this.standardGameOKResponseWithAddedAttributes(res, gameId, { playerId }, '/players');
  }

  private changeUserPositionToGame(req: Request, res: Response) {
    const gameId = new GameId(req.params.id);
    const player = new PlayerId(req.params.player);
    const position: PositionValue = req.params.position as PositionValue;

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
