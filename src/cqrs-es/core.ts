import { ProjectionStore } from "./projection-store";


export abstract class ValueType<T> {
  value: T;
  constructor(value: T) {
    this.value = value;
  }
}

export abstract class Entity {
  id: UUID;
  constructor(id: UUID = new UUID()) {
    this.id = id;
  }
}

export abstract class Aggregate {}

export abstract class Domain {}

export abstract class Event<T extends Entity> {
  timestamp: Date;
  entity?: T;
  name: string;
  constructor(
    timestamp: Date = new Date(),
    entity?: T,
    name: string = 'Event'
  ) {
    this.timestamp = timestamp;
    this.entity = entity;
    this.name = name;
  }
}

export abstract class CommandQuery<T extends Entity> {
  entity?: T;
  constructor(entity?: T) {
    this.entity = entity;
  }
}

export abstract class Command<T extends Entity> {}

export interface EventApplier<E extends Entity, T extends Event<E>> {
  apply(event: T, projections: ProjectionStore<E>): void;
}

///// commons

export class UUID extends ValueType<string> {
  constructor(uuid: string = 'TODO random GUID/UUID string here') {
    super(uuid);
  }
}
