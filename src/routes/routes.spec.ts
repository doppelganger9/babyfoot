import { Assertion, beforeEach, describe, expect, it } from 'vitest';
import sinon from 'sinon';

import { Routes } from './routes';
import { Router } from 'express';

describe('Routes', () => {
  let t: Routes;
  const routerRegisteredWithRoute = (mock: any, route: string): any =>
    (mock as sinon.SinonSpy).getCalls().find(call => call.args[0] === route);
  const expectRouterToHaveRegisteredRoute = (mock: any, route: string): Assertion =>
    expect(routerRegisteredWithRoute(mock, route)).to.not.be.undefined;

  beforeEach(() => {
    t = new Routes();
  });

  it('should initialize', () => {
    expect(t).not.to.be.undefined;
  });

  it('should register uptime routes', () => {
    const mockRouter = {
      get: sinon.fake() as any,
      post: sinon.fake() as any,
      delete: sinon.fake() as any,
    } as Router;

    t.registerRoutes(mockRouter);

    expectRouterToHaveRegisteredRoute(mockRouter.get, '/api/health');
  });

  it('should register identity routes', () => {
    const mockRouter = {
      get: sinon.fake() as any,
      post: sinon.fake() as any,
      delete: sinon.fake() as any,
    } as Router;

    t.registerRoutes(mockRouter);

    expectRouterToHaveRegisteredRoute(mockRouter.post, '/api/identity/userIdentities/register');
    expectRouterToHaveRegisteredRoute(mockRouter.post, '/api/identity/userIdentities/:id/logIn');
    expectRouterToHaveRegisteredRoute(mockRouter.delete, '/api/identity/sessions/:id');
  });

  it('should register games routes', () => {
    const mockRouter = {
      get: sinon.fake() as any,
      post: sinon.fake() as any,
      delete: sinon.fake() as any,
    } as Router;

    t.registerRoutes(mockRouter);

    expectRouterToHaveRegisteredRoute(mockRouter.post, '/api/games');
    expectRouterToHaveRegisteredRoute(mockRouter.get, '/api/games');
    expectRouterToHaveRegisteredRoute(mockRouter.get, '/api/games/:id');
    expectRouterToHaveRegisteredRoute(mockRouter.delete, '/api/games/:id');
    expectRouterToHaveRegisteredRoute(mockRouter.post, '/api/games/:id/start');
    expectRouterToHaveRegisteredRoute(mockRouter.post, '/api/games/:id/end');
    expectRouterToHaveRegisteredRoute(mockRouter.post, '/api/games/:id');
    expectRouterToHaveRegisteredRoute(mockRouter.get, '/api/games/:id/players');
    expectRouterToHaveRegisteredRoute(mockRouter.post, '/api/games/:id/players/:player/:team');
    expectRouterToHaveRegisteredRoute(mockRouter.delete, '/api/games/:id/players/:player');
    expectRouterToHaveRegisteredRoute(mockRouter.post, '/api/games/:id/goals/:player');
    expectRouterToHaveRegisteredRoute(mockRouter.post, '/api/games/:id/players/:player/position/:position');
  });

  it('should register players routes', () => {
    const mockRouter = {
      get: sinon.fake() as any,
      post: sinon.fake() as any,
      delete: sinon.fake() as any,
    } as Router;

    t.registerRoutes(mockRouter);

    expectRouterToHaveRegisteredRoute(mockRouter.post, '/api/players');
    expectRouterToHaveRegisteredRoute(mockRouter.get, '/api/players');
    expectRouterToHaveRegisteredRoute(mockRouter.get, '/api/players/:id');
    expectRouterToHaveRegisteredRoute(mockRouter.post, '/api/players/:id');
    expectRouterToHaveRegisteredRoute(mockRouter.delete, '/api/players/:id');
  });
});
