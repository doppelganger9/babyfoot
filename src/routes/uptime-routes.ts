import { Response, Request, Router } from 'express';

export class UptimeRoutes {
  constructor() {}

  public registerRoutes(router: Router): void {
    router.get('/api/health', (req, res) => this.health(req, res));
  }

  public health(req: Request, res: Response) {
    res
      .status(200)
      .send({"status": "OK"});
  }
}
