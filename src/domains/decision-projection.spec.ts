import { DecisionProjection } from './decision-projection';
import { expect } from 'chai';
import { Event } from '..';

describe('DecisionProjection', () => {
  class EventA implements Event {
    public userId: string;
    constructor() {
      this.userId = 'UserA';
    }
    public getAggregateId() { return this.userId; }
  }

  class EventB implements Event {
    public valueB: string;
    constructor() {
      this.valueB = 'ValueB';
    }
    public getAggregateId() { return this.valueB; }
  }

  it('When register Event Then call action on apply of this event', () => {
    const projection = new DecisionProjection()
      .register('EventA', function(event) {
        this.data.set('isCalled', true);
      })
      .apply(new EventA());

    expect(projection.data.get('isCalled')).is.true;
  });

  it('Given several event registered When apply Then call good handler for each event', () => {
    const projection = new DecisionProjection()
      .register('EventA', function(event: EventA) {
        this.data.set('userId', event.userId);
      })
      .register('EventB', function(event: EventB) {
        this.data.set('valueB', event.valueB);
      })
      .apply([new EventA(), new EventB()]);

    expect(projection.data.get('userId')).to.equal('UserA');
    expect(projection.data.get('valueB')).to.equal('ValueB');
  });

  it('When apply an event not registered Then nothing', () => {
    const projection = new DecisionProjection().apply(new EventA());

    expect(projection.data.get('userId')).to.be.undefined;
  });
});
