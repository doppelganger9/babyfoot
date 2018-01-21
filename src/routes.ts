import { Response, Application, Request } from 'express';
import { EventsStore, UserId, SessionsRepository, SessionId, UserIdentity, SessionHandler, UserIdentityRepository } from '.';

var updateTimeline = require('./domain/core/updateTimeline');
var createEventPublisher = require('./infrastructure/eventPublisher').create;

const eventsStore = EventsStore.create();
const userIdentitiesRepository = UserIdentityRepository.create(eventsStore);
const sessionsRepository = SessionsRepository.create(eventsStore);

//var timelineMessagesRepository = require('./infrastructure/timelineMessageRepository').create();
// var messagesRepository = require('./infrastructure/messagesRepository').create(
//   eventsStore
// );

const createPublishEvent = function createPublishEvent(eventsStore: EventsStore) {
  var eventPublisher = createEventPublisher();
  eventPublisher.onAny(eventsStore.store);
  SessionHandler.create(sessionsRepository).register(eventPublisher);
  //updateTimeline.create(timelineMessagesRepository).register(eventPublisher);

  return eventPublisher.publish;
};

const publishEvent = createPublishEvent(eventsStore);

const registerUser = function registerUser(req: Request, res: Response) {
  var email = req.body.email;

  UserIdentity.register(publishEvent, email);

  res.status(201).send({
    id: new UserId(email),
    url: '/api/identity/userIdentities/' + encodeURIComponent(email),
    logIn:
      '/api/identity/userIdentities/' + encodeURIComponent(email) + '/logIn'
  });
};

const logInUser = function logInUser(req: Request, res: Response) {
  var userId = new UserId(req.params.id);

  var userIdentity = userIdentitiesRepository.getUserIdentity(userId);

  var sessionId = userIdentity.logIn(publishEvent);

  res.status(201).send({
    id: sessionId,
    url: '/api/identity/sessions/' + encodeURIComponent(sessionId.id)
  });
};

const logOutUser = function logOutUser(req: Request, res: Response) {
  var sessionId = new SessionId(req.params.id);

  var session = sessionsRepository.getSession(sessionId);

  session.logOut(publishEvent);

  res.status(200).send('User disconnected');
};

// let quackMessage = function quackMessage(req: Request, res: Response) {
//   var author = new UserId(req.body.author);
//   var content = req.body.content;

//   var messageId = message.quack(publishEvent, author, content);

//   res.status(201).send({
//     id: messageId,
//     url: '/api/core/messages/' + encodeURIComponent(messageId.id)
//   });
// };

// let deleteMessage = function deleteMessage(req: Request, res: Response) {
//   var sessionId = new SessionId(req.body.sessionId);

//   var deleter = sessionsRepository.getUserIdOfSession(sessionId);
//   if (!deleter) {
//     res.status(403).send('Invalid session');
//     return;
//   }

//   var messageId = new message.MessageId(req.params.id);
//   var messageToDeleted = messagesRepository.getMessage(messageId);

//   messageToDeleted.delete(publishEvent, deleter);

//   res.status(200).send('Message deleted');
// };

// let getTimelineMessages = function getTimelineMessages(
//   req: Request,
//   res: Response
// ) {
//   var owner = new UserId(req.params.owner);

//   var messages = timelineMessagesRepository.getMessageOfUser(owner);

//   res.status(200).send(messages);
// };

let manageError = function manageError(action: (req: Request, res: Response) => void) {
  return function(req: Request, res: Response) {
    try {
      action(req, res);
    } catch (e) {
      if (e.constructor) {
        var errorName = e.constructor.name;

        console.log('error: ' + errorName);
        console.log(e);

        res.status(400).send({
          errorName: errorName,
          error: e
        });

        return;
      }

      throw e;
    }
  };
};

export function registerRoutes(app: Application) {
  app.post('/api/identity/userIdentities/register', manageError(registerUser));
  app.post('/api/identity/userIdentities/:id/logIn', manageError(logInUser));
  app.delete('/api/identity/sessions/:id', manageError(logOutUser));

  // app.post('/api/core/messages/quack', manageError(quackMessage));
  // app.delete('/api/core/messages/:id', manageError(deleteMessage));
  // app.get(
  //   '/api/core/timelineMessages/:owner',
  //   manageError(getTimelineMessages)
  // );
};
