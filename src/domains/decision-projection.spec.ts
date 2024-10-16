import { DecisionProjection, DecisionApplierFunction } from './decision-projection';
import { describe, expect, it } from 'vitest';
import { BFEvent } from '..';

describe('DecisionProjection', () => {
  class EventA implements BFEvent<string> {
    constructor(public valueA: string = 'TestValueA') {}
    public getAggregateId(): string {
      return this.valueA;
    }
  }

  class EventB implements BFEvent<string> {
    constructor(public valueB: string = 'TestValueB') {}
    public getAggregateId(): string {
      return this.valueB;
    }
  }

  it('When register BFEvent Then call action on apply of this event', () => {
    const projection = new DecisionProjection()
      .register('EventA', function (event) {
        this.data.set('isCalled', true);
      })
      .apply(new EventA());

    expect(projection.data.get('isCalled')).is.true;
  });

  it('Given several event registered When apply Then call good handler for each event', () => {
    // @ts-ignore
    const daf1: DecisionApplierFunction = function (event: EventA): void {
      this.data.set('valueA', event.valueA);
    };
    // @ts-ignore
    const daf2: DecisionApplierFunction = function (event: EventB): void {
      this.data.set('valueB', event.valueB);
    };
    const projection = new DecisionProjection()
      .register('EventA', daf1)
      .register('EventB', daf2)
      .apply([new EventA(), new EventB()]);

    expect(projection.data.get('valueA')).to.equal('TestValueA');
    expect(projection.data.get('valueB')).to.equal('TestValueB');
  });

  it('When apply an event not registered Then nothing', () => {
    const projection = new DecisionProjection().apply(new EventA());

    expect(projection.data.get('userId')).to.be.undefined;
  });
});
