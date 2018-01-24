import { Response, Application, Request } from 'express';
import { EventsStore, UserId, SessionsRepository, SessionId, UserIdentity, SessionHandler, UserIdentityRepository, EventPublisher, Game, generateUUID, GameId } from '.';
import { GamesRepository } from './infrastructure/game-repository';

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
  //new updateTimeline(timelineMessagesRepository).register(eventPublisher);

  // Later on, for the QUERY part of CQRS, you just need to query the appropriate repository which
  // contains ready - to - use and up - to - date projections

  return eventPublisher;
};

const eventPublisher = createEventPublisher(eventsStore);

const registerUser = function registerUser(req: Request, res: Response) {
  // parse request body attributes
  const email = req.body.email;

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
    url: '/api/game/' + encodeURIComponent(id),
    start:
      '/api/game/' + encodeURIComponent(id) + '/start',
    end:
      '/api/game/' + encodeURIComponent(id) + '/end'
  });
};

const getGame = function getGame(req: Request, res: Response) {
  // create ID value type based on request parameters
  const gameId = new GameId(req.params.id);

  // call COMMAND on Aggregate (this time it is a static method, because the Entity does not yet exist)
  const found: Game = gamesRepository.getGame(gameId);

  // send response
  res
    .status(200)
    .send({
      gameId: gameId,

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

      url: '/api/game/' + encodeURIComponent(gameId.id),
      start: '/api/game/' + encodeURIComponent(gameId.id) + '/start',
      end: '/api/game/' + encodeURIComponent(gameId.id) + '/end'
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

  res
    .status(201)
    .send({
      gameId: gameId,
      time: now,
      url: '/api/game/' + encodeURIComponent(gameId.id),
      end: '/api/game/' + encodeURIComponent(gameId.id) + '/end'
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

  res.status(201).send({
    gameId: gameId,
    time: now,
    url: '/api/game/' + encodeURIComponent(gameId.id)
  });
};


const addGoalFromPlayerToGame = function addGoalFromPlayerToGame(
  req: Request,
  res: Response
) {
  const gameId = new GameId(req.params.id);
  const player = req.params.player;

  // find Aggregate for this ID in repository
  const game = gamesRepository.getGame(gameId);

  // call COMMAND on Aggregate
  game.addGoalFromPlayer(eventPublisher, player);

  res.status(200).send({
    gameId: gameId,
    player: player,
    url: '/api/game/' + encodeURIComponent(gameId.id)
  });
};

// let deleteMessage = function deleteMessage(req: Request, res: Response) {
//   var sessionId = new SessionId(req.body.sessionId);

//   var deleter = sessionsRepository.getUserIdOfSession(sessionId);
//   if (!deleter) {
//     res.status(403).send('Invalid session');
//     return;
//   }

//   var messageId = new message.MessageId(req.params.id);
//   var messageToDeleted = messagesRepository.getMessage(messageId);

//   messageToDeleted.delete(eventPublisher, deleter);

//   res.status(200).send('Message deleted');
// };

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

        const stack = req.connection.remoteAddress && ['localhost', '::1', '127.0.0.1'].includes(req.connection.remoteAddress) ? e.stack.split('\n') : undefined;

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

  app.post('/api/game', manageError(createGame));
  app.get('/api/game/:id', manageError(getGame));
  app.post('/api/game/:id/start', manageError(startGame));
  app.post('/api/game/:id/end', manageError(endGame));
  app.post('/api/game/:id/goal/:player', manageError(addGoalFromPlayerToGame));

};
