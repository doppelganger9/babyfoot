import { DecisionProjection, DecisionApplierFunction } from '..';
import { PlayerId } from '.';
import { BFEvent } from '../..';

export class PlayerDecisionProjection {
  private projection: DecisionProjection; // composition not inheritance
  constructor(data?: Map<string, any>, handlers?: Map<string, (event: BFEvent<any>) => void>) {
    this.projection = new DecisionProjection(data, handlers);
  }

  get isDeleted(): boolean {
    return this.projection.data.get('isDeleted');
  }
  get id(): PlayerId {
    return this.projection.data.get('id');
  }
  get displayName(): string {
    return this.projection.data.get('displayName');
  }
  get email(): string {
    return this.projection.data.get('email');
  }
  get avatar(): string {
    return this.projection.data.get('avatar');
  }
  // get creationDate(): string { return this.projection.data.get('creationDate'); }
  // get lastUpdateDate(): string { return this.projection.data.get('lastUpdateDate'); }

  public register(eventType: string, action: DecisionApplierFunction): PlayerDecisionProjection {
    this.projection.register(eventType, action);
    return this;
  }

  public apply(events: Array<BFEvent> | BFEvent): PlayerDecisionProjection {
    this.projection.apply(events);
    return this;
  }
}
