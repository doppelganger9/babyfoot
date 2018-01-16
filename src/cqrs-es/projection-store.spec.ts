import { EventListener, EventStream } from '..';
import { Event, Entity, UUID } from '..';
import { expect } from 'chai';
import { ProjectionStore } from './projection-store';

class TestEntity extends Entity {
  test: string;
  constructor(id: string) {
    super(new UUID(id));
    this.test = 'test';
  }
}

describe('ProjectionStore', () => {
  let t: ProjectionStore<TestEntity>;

  beforeEach(() => {
    t = new ProjectionStore<TestEntity>();
  });

  it('should add an item', () => {
    const id = '1';
    const testEntity = new TestEntity(id);
    t.add(testEntity);
    const added = t.itemsById.get(id);
    expect(added).to.not.be.undefined;
    expect(added).to.not.be.equal(testEntity); // immutability
    expect(added.id.value, 'added entity id').to.equal(id); // immutability
  });

  it('should not add an item if there is no id', () => {
    const id = '';
    const testEntity = new TestEntity(id);
    expect(() => t.add(testEntity)).to.throw(Error, 'entity must have an ID');
    expect(t.itemsById).to.be.empty;
  });

  it('should remove an item', () => {
    const id = '1';
    const testEntity = new TestEntity(id);
    t.add(testEntity);
    t.removeById(id);
    const added = t.itemsById.get(id);
    expect(added).to.be.undefined;
  });

  it('should find an item by its id', () => {
    const id = '1';
    const testEntity = new TestEntity(id);
    t.add(testEntity);
    const found = t.getById(id);
    const added = t.itemsById.get(id);
    expect(found).to.not.be.equal(added); // immutable copy each time
    expect(found.test).to.equal(added.test);
    expect(found.id).to.be.equal(added.id); // is this what we want ? should a deep copy not create a different object?
    expect(found.id.value).to.equal(added.id.value);
  });

  it('should mutate an item', () => {
    const id = '1';
    const testEntity = new TestEntity(id);
    t.add(testEntity);
    const beforeMutation = t.getById(id);
    expect(beforeMutation.test).to.equal(testEntity.test);
    const mutated = Object.assign({}, testEntity);
    mutated.test = 'toto';
    t.mutate(mutated);
    const mutated2 = t.itemsById.get(id);
    expect(mutated2).to.not.be.equal(mutated);
    expect(mutated2.test).to.equal('toto');
    expect(mutated2).to.not.be.equal(testEntity);
    expect(beforeMutation.test).to.equal(testEntity.test);
  });
});
