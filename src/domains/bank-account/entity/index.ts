import { Entity, UUID } from "../../..";

// Entity / Projection / Aggregate ?
export class BankAccount extends Entity {
  balance: number;
  blockCountdown: number;
  blockedUntil?: Date;

  constructor(id: string, balance: number) {
    super(new UUID(id));
    this.balance = 0;
    this.blockCountdown = 3;
    this.blockedUntil = undefined;
  }
}
