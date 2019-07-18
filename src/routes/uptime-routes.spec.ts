import { expect } from 'chai';
import * as sinon from 'sinon';

import { EventPublisher, BFEventsStore } from '..';
import { UptimeRoutes } from './uptime-routes';
import { Router, Request, Response } from 'express';

describe('Uptime Routes', () => {
  let t: UptimeRoutes;

  beforeEach(() => {
    t = new UptimeRoutes();
  });

  it('should initialize', () => {
    expect(t).not.to.be.undefined;
  });

  it('should register route /api/health', () => {
    const mockRouter = {get: sinon.fake() as any} as Router;

    t.registerRoutes(mockRouter);

    expect((mockRouter.get as sinon.SinonSpy).calledOnce).to.be.true;
    expect((mockRouter.get as sinon.SinonSpy).firstCall.args[0]).to.equal('/api/health');
  });

  it('should have a health route that returns HTTP 200 OK with an expected JSON payload', () => {
    const mockReq = {} as unknown as Request;
    const memo: any = {};
    const mockRes = new MockResponse(memo) as unknown as Response;

    t.health(mockReq, mockRes);

    expect(memo.status).to.equal(200);
    expect(JSON.stringify(memo.send)).to.equal('{"status":"OK"}');
  });

});

class MockResponse {
  constructor(public memo: any) {
    this.memo = memo;
  }

  public send(obj: any): MockResponse {
    this.memo.send = obj;
    return this;
  }

  public status(code: number): MockResponse {
    this.memo.status = code;
    return this;
  }
}
