import { Response, Application, Request } from 'express';
import { EventsStore, UserId, SessionsRepository, SessionId, UserIdentity, SessionHandler, UserIdentityRepository, EventPublisher, Game, generateUUID, GameId, PositionValue } from '.';
import { GamesRepository } from './infrastructure/game-repository';
import { GameListItemProjection } from './domains/game/game-list-item-projection';
import { GameHandler } from './domains/game/game-handler';
import { Player, TeamColors } from './domains/game/game-id';

const eventsStore = new EventsStore();
const userIdentitiesRepository = new UserIdentityRepository(eventsStore);
const sessionsRepository = new SessionsRepository(eventsStore);
const gamesRepository = new GamesRepository(eventsStore);

const createEventPublisher = function createEventPublisher(
  eventsStore: EventsStore
) {

  const eventPublisher = new EventPublisher();

  // this will Store all events in the events' Store
  eventPublisher.onAny(eventsStore.store);
  // all repositories are injected with the eventsStore, and thus will benefit from the above line.

  // this will also publish events for side-effects, that is, other projections listening on diverse events.
  // Here, Session and Timeline Update projections:
  new SessionHandler(sessionsRepository).register(eventPublisher);
  new GameHandler(gamesRepository).register(eventPublisher);

  // Later on, for the QUERY part of CQRS, you just need to query the appropriate repository which
  // contains ready - to - use and up - to - date projections

  return eventPublisher;
};

const eventPublisher = createEventPublisher(eventsStore);

const registerUser = function registerUser(req: Request, res: Response) {
  // parse request body attributes
  const email: string = req.body.email;

  // call COMMAND on Aggregate (this time it is a static method)
  UserIdentity.register(eventPublisher, email);

  // send response
  res.status(201).send({
    id: new UserId(email),
    url: '/api/identity/userIdentities/' + encodeURIComponent(email),
    logIn:
      '/api/identity/userIdentities/' + encodeURIComponent(email) + '/logIn'
  });
};

const logInUser = function logInUser(req: Request, res: Response) {
  // create ID value type based on request parameters
  const userId = new UserId(req.params.id);
  // find Aggregate for this ID in repository
  const userIdentity = userIdentitiesRepository.getUserIdentity(userId);
  // call COMMAND on Aggregate
  const sessionId = userIdentity.logIn(eventPublisher);

  res.status(201).send({
    id: sessionId,
    url: '/api/identity/sessions/' + encodeURIComponent(sessionId.id)
  });
};

const logOutUser = function logOutUser(req: Request, res: Response) {
  const sessionId = new SessionId(req.params.id);

  // QUERY to retrieve Aggregate
  const session = sessionsRepository.getSession(sessionId);

  // COMMAND
  session.logOut(eventPublisher);

  res.status(200).send('User disconnected');
};

//// GAME /////


const createGame = function createGame(req: Request, res: Response) {
  const id = generateUUID();
  // call COMMAND on Aggregate (this time it is a static method, because the Entity does not yet exist)
  Game.createGame(eventPublisher, id);

  // send response
  res.status(201).send({
    gameId: new GameId(id),
    // TODO: the HATEOAS links should be generated in some way given the state of the Game. Maybe it is a new ActionsOnGameProjection ?
    url: '/api/games/' + encodeURIComponent(id),
    start: '/api/games/' + encodeURIComponent(id) + '/start',
    end: '/api/games/' + encodeURIComponent(id) + '/end'
  });
};

const getGame = function getGame(req: Request, res: Response) {
  // create ID value type based on request parameters
  const gameId = new GameId(req.params.id);

  // call COMMAND on Aggregate (this time it is a static method, because the Entity does not yet exist)
  const found: Game = gamesRepository.getGame(gameId);

  // send response
  standardGameOKResponseWithAddedAttributes(res, gameId, {
      currentEndDatetime: found.currentEndDatetime,
      currentStartDatetime: found.currentStartDatetime,
      duration: found.duration,
      initialDatetime: found.initialDatetime,
      isDeleted: found.isDeleted,
      players: found.players,
      pointsTeamBlue: found.pointsTeamBlue,
      pointsTeamRed: found.pointsTeamRed,
      teamBlueMembers: found.teamBlueMembers,
      teamRedMembers: found.teamRedMembers,
      winner: found.winner,

      start: '/api/games/' + encodeURIComponent(gameId.id) + '/start',
      end: '/api/games/' + encodeURIComponent(gameId.id) + '/end'
  });
};

const getGameList = function getGameList(req: Request, res: Response) {
  // TODO : add _embedded option? (will be 1000 times slower)

  const all: Array<GameListItemProjection> = gamesRepository.getGames();

  // send response
  res
    .status(200)
    .send({
      url: '/api/games',
      list: all.map(game => {
        return {
          gameId: game.gameId,
          created: game.timestamp,

          url: '/api/games/' + encodeURIComponent(game.gameId.id)
        };
      })
    });

};

const startGame = function startGame(req: Request, res: Response) {
  const now = new Date();
  // create ID value type based on request parameters
  const gameId = new GameId(req.params.id);
  // find Aggregate for this ID in repository
  const game = gamesRepository.getGame(gameId);
  // call COMMAND on Aggregate
  game.startGame(eventPublisher);

  standardGameOKResponseWithAddedAttributes(res, gameId, {
    time: now,
    end: '/api/games/' + encodeURIComponent(gameId.id) + '/end'
  });
};

const endGame = function endGame(req: Request, res: Response) {
  const now = new Date();
  // create ID value type based on request parameters
  const gameId = new GameId(req.params.id);
  // find Aggregate for this ID in repository
  const game = gamesRepository.getGame(gameId);
  // call COMMAND on Aggregate
  game.endGame(eventPublisher);

  standardGameOKResponseWithAddedAttributes(res, gameId, { time: now } )
};


const addGoalFromPlayerToGame = function addGoalFromPlayerToGame(
  req: Request,
  res: Response
) {
  const gameId = new GameId(req.params.id);
  const player: Player = req.params.player;

  // find Aggregate for this ID in repository
  const game = gamesRepository.getGame(gameId);

  // call COMMAND on Aggregate
  game.addGoalFromPlayer(eventPublisher, player);

  standardGameOKResponseWithAddedAttributes(res, gameId, { player });
};

const getPlayersInGame = function getPlayersInGame(req: Request, res: Response) {
  const gameId = new GameId(req.params.id);

  // find Aggregate for this ID in repository
  const found = gamesRepository.getGame(gameId);

  standardGameOKResponseWithAddedAttributes(res, gameId, {
    players: found.players,
    pointsTeamBlue: found.pointsTeamBlue,
    pointsTeamRed: found.pointsTeamRed,
    teamBlueMembers: found.teamBlueMembers,
    teamRedMembers: found.teamRedMembers,
    winner: found.winner
  }, '/players');

}

const addPlayerToGame = function getPlayerInGame(
  req: Request,
  res: Response
) {
  const gameId = new GameId(req.params.id);
  const player: Player = req.params.player;
  const team: TeamColors = req.params.team;

  // find Aggregate for this ID in repository
  const found = gamesRepository.getGame(gameId);

  // call COMMAND on Aggregate
  found.addPlayerToGame(eventPublisher, player, team);

  standardGameOKResponseWithAddedAttributes(res, gameId, { player, team }, '/players');

};


const removePlayerFromGame = function removePlayerFromGame(req: Request, res: Response) {
  const gameId = new GameId(req.params.id);
  const player: Player = req.params.player;

  // find Aggregate for this ID in repository
  const found = gamesRepository.getGame(gameId);

  // call COMMAND on Aggregate
  found.removePlayerFromGame(eventPublisher, player);

  standardGameOKResponseWithAddedAttributes(res, gameId, { player }, '/players');
};

const changeUserPositionToGame = function changeUserPositionToGame(req: Request, res: Response) {
  const gameId = new GameId(req.params.id);
  const player: Player = req.params.player;
  const position: PositionValue = req.params.position;

  // find Aggregate for this ID in repository
  const found = gamesRepository.getGame(gameId);

  // call COMMAND on Aggregate
  found.changeUserPositionOnGame(eventPublisher, player, position);

  standardGameOKResponseWithAddedAttributes(res, gameId, { player, position });
}

function standardGameOKResponseWithAddedAttributes(res: Response, gameId: GameId, addThisToTheBody: any = {}, context: string = ''): void {
    res
      .status(200)
      .send({
        gameId: gameId,
        ...addThisToTheBody,// destructuring FTW! \o/
        url: '/api/games/' + encodeURIComponent(gameId.id) + context
      });
}

/**
 * higher order function to handle all errors thrown to create an appropriate HTTP 400 Response.
 * @param action
 */
let manageError = function manageError(action: (req: Request, res: Response) => void) {
  return function managedErrorForAction (req: Request, res: Response) {
    try {
      action(req, res);
    } catch (e) {
      if (e.constructor) {
        const errorName = e.constructor.name;

        console.log('error: ' + errorName);
        console.log(e);

        const isLocal = req.connection.remoteAddress && ['localhost', '::1', '127.0.0.1'].includes(req.connection.remoteAddress);
        const stack = isLocal ? e.stack.split('\n') : undefined;

        res
          .status(400)
          .send({
            errorName: errorName,
            error: e,
            stack
          });

        return;
      }

      throw e;
    }
  };
};

export function registerRoutes(app: Application): void {
  app.post('/api/identity/userIdentities/register', manageError(registerUser));
  app.post('/api/identity/userIdentities/:id/logIn', manageError(logInUser));
  app.delete('/api/identity/sessions/:id', manageError(logOutUser));

  app.post('/api/games', manageError(createGame));
  app.get('/api/games', manageError(getGameList));
  app.get('/api/games/:id', manageError(getGame));
  app.post('/api/games/:id/start', manageError(startGame));
  app.post('/api/games/:id/end', manageError(endGame));

  app.get('/api/games/:id/players', manageError(getPlayersInGame));
  app.post('/api/games/:id/players/:player/:team', manageError(addPlayerToGame));
  app.delete('/api/games/:id/players/:player', manageError(removePlayerFromGame));
  app.post('/api/games/:id/goals/:player', manageError(addGoalFromPlayerToGame));
  app.post('/api/games/:id/players/:player/position/:position', manageError(changeUserPositionToGame));

  // app.get('/api/games/:id/comments', manageError(getCommentsOnGame));
  // app.post('/api/games/:id/comments', manageError(addCommentToGame));
  // app.post('/api/games/:id/comments/:commentId', manageError(changeCommentOnGame));
  // app.delete('/api/games/:id/comments/:commentId', manageError(removeCommentOnGame));

  // app.get('/api/games/:id/reviews', manageError(getReviewsOnGame));
  // app.post('/api/games/:id/reviews', manageError(addReviewOnGame));
  // app.post('/api/games/:id/reviews/:reviewId', manageError(updateReviewOnGame));
  // app.delete('/api/games/:id/reviews/:reviewId', manageError(removeReviewOnGame));

};
