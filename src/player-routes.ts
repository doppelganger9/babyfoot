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
import { PlayersRepository, PlayerListItemProjection } from './infrastructure/player-repository';
import { GameListItemProjection } from './domains/game/game-list-item-projection';
import { GameHandler } from './domains/game/game-handler';
import { TeamColors } from './domains/game/game-id';
import { PlayerId } from './domains/player';
import { PlayerHandler } from './domains/player/player-handler';
import { Player } from './domains/player';

export class PlayerRoutes {
  constructor(
    public eventsStore: EventsStore,
    public playersRepository: PlayersRepository,
    public eventPublisher: EventPublisher,
  ) {}

  public registerRoutes(router: Router): void {
    router.post('/api/players', (req, res) => this.createPlayer(req, res));
    router.get('/api/players', (req, res) => this.getPlayerList(req, res));
    router.get('/api/players/:id', (req, res) => this.getPlayer(req, res));
    router.post('/api/players/:id/confirm', (req, res) => this.confirmAccount(req, res));
    router.post('/api/players/:id', (req, res) => this.updatePlayer(req, res));
    router.delete('/api/players/:id', (req, res) => this.deletePlayer(req, res));
  }

  public createPlayer(req: Request, res: Response) {
    const fields = new Map<string, any>();
    if (!req.body.firstName) {
      throw new Error('firstName is required');
    }
    fields.set('firstName', req.body.firstName);
    if (!req.body.lastName) {
      throw new Error('lastName is required');
    }
    fields.set('lastName', req.body.lastName);
    if (!req.body.email) {
      throw new Error('email is required');
    }
    fields.set('email', req.body.email);
    fields.set('avatar', req.body.avatar);

    // call COMMAND on Aggregate (this time it is a static method, because the Entity does not yet exist)
    const id = Player.createPlayer(this.eventPublisher, fields);

    // send response
    res
      .status(201)
      .send({
        playerId: id,
        firstName: fields.get('firstName'),
        lastName: fields.get('lastName'),
        avatar: fields.get('avatar'),
        email: fields.get('email'),
        // TODO: the HATEOAS links should be generated in some way given the state of the Player. Maybe it is a new ActionsOnPlayerProjection ?
        url: '/api/players/' + encodeURIComponent(id.id),
      });
  }

  public getPlayer(req: Request, res: Response) {
    // create ID value type based on request parameters
    const playerId = new PlayerId(req.params.id);

    // call COMMAND on Aggregate (this time it is a static method, because the Entity does not yet exist)
    const found: Player = this.playersRepository.getPlayer(playerId);

    const token = process.env.NODE_ENV === 'production' ? {} : { confirmationToken: found.projection.confirmationToken };

    // send response
    this.standardPlayerOKResponseWithAddedAttributes(res, playerId, {
      isDeleted: found.projection.isDeleted,
      isAccountConfirmed: found.projection.isAccountConfirmed,
      avatar: found.projection.avatar,
      firstName: found.projection.firstName,
      lastName: found.projection.lastName,
      email: found.projection.email,
      ...token
    });
  }

  public getPlayerList(req: Request, res: Response) {
    // TODO : add _embedded option? (will be 1000 times slower)

    const all: Array<PlayerListItemProjection> = this.playersRepository.getPlayers();

    // send response
    res.status(200).send({
      list: all.map(player => {
        return {
          playerId: player.playerId,

          url: '/api/players/' + encodeURIComponent(player.playerId.id),
        };
      }),
      url: '/api/players',
    });
  }

  public deletePlayer(req: Request, res: Response) {
    // create ID value type based on request parameters
    const playerId = new PlayerId(req.params.id);
    // find Aggregate for this ID in repository
    const player = this.playersRepository.getPlayer(playerId);
    // call COMMAND on Aggregate
    player.deletePlayer(this.eventPublisher);

    this.standardPlayerOKResponseWithAddedAttributes(res, playerId);
  }

  public updatePlayer(req: Request, res: Response) {
    const fields = new Map<string, any>();
    if (!req.body.firstName) {
      throw new Error('firstName is required');
    }
    fields.set('firstName', req.body.firstName);
    if (!req.body.lastName) {
      throw new Error('lastName is required');
    }
    fields.set('lastName', req.body.lastName);
    if (!req.body.email) {
      throw new Error('email is required');
    }
    fields.set('email', req.body.email);
    fields.set('avatar', req.body.avatar);

    // create ID value type based on request parameters
    const playerId = new PlayerId(req.params.id);
    // find Aggregate for this ID in repository
    const player = this.playersRepository.getPlayer(playerId);
    // call COMMAND on Aggregate
    player.updatePlayer(this.eventPublisher, fields);

    // find updated Aggregate
    const updatedPlayer = this.playersRepository.getPlayer(playerId);

    this.standardPlayerOKResponseWithAddedAttributes(res, playerId, {
      firstName: updatedPlayer.projection.firstName,
      lastName: updatedPlayer.projection.lastName,
      avatar: updatedPlayer.projection.avatar,
      isDeleted: updatedPlayer.projection.isDeleted,
      isAccountConfirmed: updatedPlayer.projection.isAccountConfirmed,
      email: updatedPlayer.projection.email,
    });
  }

  public confirmAccount(req: Request, res: Response) {
    const token = req.query.token;
    // create ID value type based on request parameters
    const playerId = new PlayerId(req.params.id);
    // find Aggregate for this ID in repository
    const player = this.playersRepository.getPlayer(playerId);
    // call COMMAND on Aggregate
    player.confirmAccount(this.eventPublisher, token);

    this.standardPlayerOKResponseWithAddedAttributes(res, playerId);
  }

  public standardPlayerOKResponseWithAddedAttributes(
    res: Response,
    playerId: PlayerId,
    addThisToTheBody: any = {},
    context: string = '',
  ): void {
    res.status(200).send({
      playerId,
      ...addThisToTheBody, // destructuring FTW! \o/
      url: `/api/players/${encodeURIComponent(playerId.id)}${context}`,
    });
  }
}
