export abstract class ValueType {

  abstract toString(): string;

  equals(other: ValueType): boolean {
    if (!other) {
      return false;
    }
    return this.toString() === other.toString();
  }
}
