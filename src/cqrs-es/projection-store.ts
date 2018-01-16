import { Entity } from '.';

export class ProjectionStore<T extends Entity> {
  //items: Array<T>;
  itemsById: Map<string, T>;

  constructor() {
    //this.items = [];
    this.itemsById = new Map();
  }

  add(entity: T): void /* or an ID if I generate it here */ {
    if (!entity.id || !entity.id.value) {
      // Or I could generate one and return it?
      throw new Error('entity must have an ID');
    }
    //this.items.push(entity);
    const copy = Object.assign({}, entity);
    this.itemsById.set(entity.id.value, copy);
  }

  getById(id: string): T | undefined {
    // NOTE: maybe reconstruct all projections under some special circumstances ?
    const found = this.itemsById.get(id);
    return found ? (Object.assign({}, found) as T) : found;
  }

  mutate(mutated: T) {
    const current = this.getById(mutated.id.value);
    if (current !== mutated) {
      //replace current by mutated
      // new copy if ever mutated is... mutated outside later on to protect the store's immutability.
      this.itemsById.set(mutated.id.value, Object.assign(current, mutated));
    }
  }

  removeById(id: string): void {
    this.itemsById.delete(id);
  }
}
