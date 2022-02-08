import { Router, Request, Response } from 'express';

import { EventPublisher, BFEventsStore, UserIdentity, UserId, SessionId, SessionsRepository } from '..';
import { PlayersRepository } from '../infrastructure/player-repository';
import { UserIdentityRepository } from '../infrastructure/user-identity-repository';

export class IdentityRoutes {
  constructor(
    public eventsStore: BFEventsStore,
    public userIdentitiesRepository: UserIdentityRepository,
    public sessionsRepository: SessionsRepository,
    public eventPublisher: EventPublisher,
  ) {}

  public registerRoutes(router: Router): void {
    router.post('/api/identity/userIdentities/register', (req, res) => this.registerUser(req, res));
    router.post('/api/identity/userIdentities/:id/logIn', (req, res) => this.logInUser(req, res));
    router.delete('/api/identity/sessions/:id', (req, res) => this.logOutUser(req, res));
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
}
