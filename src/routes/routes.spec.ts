import { expect } from 'chai';
import * as sinon from 'sinon';

import { EventPublisher, BFEventsStore } from '..';
import { Routes } from './routes';
import { Router, Request, Response } from 'express';

describe('Routes', () => {
  let t: Routes;

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

    expect((mockRouter.get as sinon.SinonSpy).getCalls().find(call => call.args[0] === '/api/health')).to.not.be.undefined;
  });

  it('should register identity routes', () => {
    const mockRouter = {
      get: sinon.fake() as any,
      post: sinon.fake() as any,
      delete: sinon.fake() as any,
    } as Router;

    t.registerRoutes(mockRouter);

    expect((mockRouter.post as sinon.SinonSpy).getCalls().find(call => call.args[0] === '/api/identity/userIdentities/register')).to.not.be.undefined;
    expect((mockRouter.post as sinon.SinonSpy).getCalls().find(call => call.args[0] === '/api/identity/userIdentities/:id/logIn')).to.not.be.undefined;
    expect((mockRouter.delete as sinon.SinonSpy).getCalls().find(call => call.args[0] === '/api/identity/sessions/:id')).to.not.be.undefined;
  });

  it('should register games routes', () => {
    const mockRouter = {
      get: sinon.fake() as any,
      post: sinon.fake() as any,
      delete: sinon.fake() as any,
    } as Router;

    t.registerRoutes(mockRouter);

    expect((mockRouter.post as sinon.SinonSpy).getCalls().find(call => call.args[0] === '/api/games')).to.not.be.undefined;
    expect((mockRouter.get as sinon.SinonSpy).getCalls().find(call => call.args[0] === '/api/games')).to.not.be.undefined;
    expect((mockRouter.get as sinon.SinonSpy).getCalls().find(call => call.args[0] === '/api/games/:id')).to.not.be.undefined;
    expect((mockRouter.delete as sinon.SinonSpy).getCalls().find(call => call.args[0] === '/api/games/:id')).to.not.be.undefined;
    expect((mockRouter.post as sinon.SinonSpy).getCalls().find(call => call.args[0] === '/api/games/:id/start')).to.not.be.undefined;
    expect((mockRouter.post as sinon.SinonSpy).getCalls().find(call => call.args[0] === '/api/games/:id/end')).to.not.be.undefined;
    expect((mockRouter.post as sinon.SinonSpy).getCalls().find(call => call.args[0] === '/api/games/:id')).to.not.be.undefined;
    expect((mockRouter.get as sinon.SinonSpy).getCalls().find(call => call.args[0] === '/api/games/:id/players')).to.not.be.undefined;
    expect((mockRouter.post as sinon.SinonSpy).getCalls().find(call => call.args[0] === '/api/games/:id/players/:player/:team')).to.not.be.undefined;
    expect((mockRouter.delete as sinon.SinonSpy).getCalls().find(call => call.args[0] === '/api/games/:id/players/:player')).to.not.be.undefined;
    expect((mockRouter.post as sinon.SinonSpy).getCalls().find(call => call.args[0] === '/api/games/:id/goals/:player')).to.not.be.undefined;
    expect((mockRouter.post as sinon.SinonSpy).getCalls().find(call => call.args[0] === '/api/games/:id/players/:player/position/:position')).to.not.be.undefined;
  });

  it('should register players routes', () => {
    const mockRouter = {
      get: sinon.fake() as any,
      post: sinon.fake() as any,
      delete: sinon.fake() as any,
    } as Router;

    t.registerRoutes(mockRouter);

    expect((mockRouter.post as sinon.SinonSpy).getCalls().find(call => call.args[0] === '/api/players')).to.not.be.undefined;
    expect((mockRouter.get as sinon.SinonSpy).getCalls().find(call => call.args[0] === '/api/players')).to.not.be.undefined;
    expect((mockRouter.get as sinon.SinonSpy).getCalls().find(call => call.args[0] === '/api/players/:id')).to.not.be.undefined;
    expect((mockRouter.post as sinon.SinonSpy).getCalls().find(call => call.args[0] === '/api/players/:id')).to.not.be.undefined;
    expect((mockRouter.delete as sinon.SinonSpy).getCalls().find(call => call.args[0] === '/api/players/:id')).to.not.be.undefined;
  });

});
