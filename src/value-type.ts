export abstract class ValueType {

  public abstract toString(): string;

  public equals(other: ValueType): boolean {
    if (!other) {
      return false;
    }
    return this.toString() === other.toString();
  }
}
