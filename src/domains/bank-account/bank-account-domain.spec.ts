import { EventStream } from '../../cqrs-es';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const { expect, assert } = chai;
import {
  BankAccountCreated,
  BankAccount,
  BankAccountCredited,
  BankAccountDebited
} from '..';
import { BankAccountDomain } from '..';

describe('BankAccountDomain', () => {
  let t: EventStream;
  let bankAccountDomain: BankAccountDomain;

  beforeEach(() => {
    t = new EventStream();
    bankAccountDomain = new BankAccountDomain(t);
    t.registerListener(bankAccountDomain);
  });

  describe('createAccount()', () => {
    it('should create a Bank Account', () => {
      const testId = '1';
      expect(t.eventStore.length, 'eventStore should be empty').to.equal(0);
      expect(t.listeners.length, 'listeners should have 1 element').to.equal(1);
      bankAccountDomain.createAccount(testId);
      expect(t.eventStore.length, 'eventStore should have 1 event').to.equal(1);
      expect(t.listeners.length, 'listeners should have 1 element').to.equal(1);
      const account = bankAccountDomain.getAccount(testId);
      expect(account.id.value, 'id should equal ' + testId).to.equal(testId);
      expect(account.balance, 'balance shoud be 0').to.equal(0);
      expect(account.blockCountdown, 'block countdown shoud be 3').to.equal(3);
      expect(account.blockedUntil, 'blocked until date shoud be undefined').to
        .be.undefined;
    });

    // to test errors on async functions, we have to use this formulation (after a lot of trial and errors)
    it('should not allow to create a Bank Account without ID', () => {
      const testId = '';
      expect(() => bankAccountDomain.createAccount(testId)).to.throw(
        Error,
        'id must be provided'
      );
    });

    it('should not allow to create a Bank Account with a duplicate ID', () => {
      bankAccountDomain.createAccount('1');
      // until here nothing new, I already tested in previous tests.
      const testId = '1';
      expect(() => bankAccountDomain.createAccount(testId)).to.throw(
        Error,
        'account with this ID already exists'
      );
    });
  });

  describe('creditAccount()', () => {
    it('should credit 100 on a Bank Account', () => {
      const testId = '1';
      bankAccountDomain.createAccount(testId);
      const account = bankAccountDomain.getAccount(testId);
      // until here nothing new, I already tested in previous tests.
      bankAccountDomain.creditAccount('1', 100);
      const accountAfterCredit = bankAccountDomain.getAccount(testId);
      expect(accountAfterCredit.id.value, 'id should equal ' + testId).to.equal(
        testId
      );
      expect(accountAfterCredit.balance).to.equal(100);
      expect(accountAfterCredit.blockCountdown).to.equal(3);
      expect(accountAfterCredit.blockedUntil).to.be.undefined;
    });

    it('should not credit an inexistent Bank Account', () => {
      const testId = '1';
      // until here nothing new, I already tested in previous tests.
      expect(() => bankAccountDomain.creditAccount('1', 100)).to.throw(
        Error,
        'account with this ID does not exist'
      );
    });

    it('should not credit negative value on a Bank Account', () => {
      const testId = '1';
      bankAccountDomain.createAccount(testId);
      // until here nothing new, I already tested in previous tests.
      expect(() => bankAccountDomain.creditAccount(testId, -100)).to.throw(
        Error,
        'amount must be > 0'
      );
    });

    it('should not credit a Bank Account with invalid ID', () => {
      const testId = '';
      expect(() => bankAccountDomain.creditAccount(testId, 100)).to.throw(
        Error,
        'id must be provided'
      );
    });
  });

  describe('debitAccount()', () => {
    it('should not debit negative value on a Bank Account', () => {
      const testId = '1';
      bankAccountDomain.createAccount(testId);
      // until here nothing new, I already tested in previous tests.
      expect(() => bankAccountDomain.debitAccount(testId, -100)).to.throw(
        Error,
        'amount must be > 0'
      );
    });

    it('should not debit a Bank Account with invalid ID', () => {
      const testId = '';
      expect(() => bankAccountDomain.debitAccount(testId, 100)).to.throw(
        Error,
        'id must be provided'
      );
    });

    it('should not debit an inexistent Bank Account', () => {
      const testId = '1';
      // until here nothing new, I already tested in previous tests.
      expect(() => bankAccountDomain.debitAccount('1', 100)).to.throw(
        Error,
        'account with this ID does not exist'
      );
    });

    it('should debit 100 on a Bank Account with 100 in current balance', () => {
      const testId = '1';
      bankAccountDomain.createAccount(testId);
      bankAccountDomain.creditAccount(testId, 100);
      // until here nothing new, I already tested in previous tests.
      bankAccountDomain.debitAccount(testId, 100);
      const account = bankAccountDomain.getAccount(testId);
      expect(account.id.value, 'id should equal ' + testId).to.equal(testId);
      expect(account.balance).to.equal(0);
      expect(account.blockCountdown).to.equal(3);
      expect(account.blockedUntil).to.be.undefined;
    });

    it('should not allow a debit > than current balance', () => {
      const testId = '1';
      bankAccountDomain.createAccount(testId);
      bankAccountDomain.creditAccount(testId, 100);
      // until here nothing new, I already tested in previous tests.
      expect(() => bankAccountDomain.debitAccount(testId, 150)).to.throw(
        Error,
        'insufficient balance'
      );
      const account = bankAccountDomain.getAccount(testId);
      expect(account.id.value, 'id should equal ' + testId).to.equal(testId);
      expect(account.balance).to.equal(100);
      expect(account.blockCountdown).to.equal(2);
      expect(account.blockedUntil).to.be.undefined;
    });

    it('should block an account after trying to debit 4 times with an insufficient balance', () => {
      const testId = '1';
      bankAccountDomain.createAccount(testId);
      bankAccountDomain.creditAccount(testId, 100);
      // until here nothing new, I already tested in previous tests.
      expect(() => bankAccountDomain.debitAccount(testId, 150)).to.throw(
        Error,
        'insufficient balance'
      );
      expect(() => bankAccountDomain.debitAccount(testId, 150)).to.throw(
        Error,
        'insufficient balance'
      );
      expect(() => bankAccountDomain.debitAccount(testId, 150)).to.throw(
        Error,
        'insufficient balance'
      );
      expect(function fourthDebitAccountTry() {
        bankAccountDomain.debitAccount(testId, 150);
      }).to.throw(Error, /account blocked until/);

      const account = bankAccountDomain.getAccount(testId);
      expect(account.id.value, 'id should equal ' + testId).to.equal(testId);
      expect(account.balance).to.equal(100);
      expect(account.blockCountdown).to.equal(0);
      expect(account.blockedUntil, 'blocked until').to.not.be.undefined;
    });

    it('should not allow a debit on a blocked Bank Account', () => {
      const testId = '1';
      bankAccountDomain.createAccount(testId);
      // Variant: Here I'm manipulating the projections directly...
      // like that, if I introduce a bug in the other methods, it will not break, right ?
      // Okay, but when I refactor the projections from an array to a full-fledged object, it broke my tests
      // because I use the internal representation of the object, not its public API.
      bankAccountDomain.projections.itemsById.get('1').blockCountdown = 0;
      const now = new Date();
      bankAccountDomain.projections.itemsById.get('1').blockedUntil = new Date(
        now.getTime() + 1000 * 60 * 5
      );
      bankAccountDomain.projections.itemsById.get('1').balance = 111;
      // until here nothing new, I already tested in previous tests.
      expect(() => bankAccountDomain.debitAccount(testId, 100)).to.throw(
        Error,
        /account blocked until/
      );
    });

    it('should allow a debit on a blocked Bank Account if the until date is passed, and unblock it', () => {
      const testId = '1';
      bankAccountDomain.createAccount(testId);
      // Variant: Here I'm manipulating the projections directly...
      // like that, if I introduce a bug in the other methods, it will not break, right ?
      // Okay, but when I refactor the projections from an array to a full-fledged object, it broke my tests
      // because I use the internal representation of the object, not its public API.
      bankAccountDomain.projections.itemsById.get('1').blockCountdown = 0;
      const now = new Date();
      bankAccountDomain.projections.itemsById.get('1').blockedUntil = new Date(
        now.getTime() - 1000 * 60 * 5
      );
      bankAccountDomain.projections.itemsById.get('1').balance = 111;
      // until here nothing new, I already tested in previous tests.
      bankAccountDomain.debitAccount(testId, 100);

      const account = bankAccountDomain.getAccount(testId);
      expect(account.id.value, 'id should equal ' + testId).to.equal(testId);
      expect(account.balance).to.equal(11);
      expect(account.blockCountdown).to.equal(3);
      expect(account.blockedUntil).to.be.undefined;
    });
  });

  describe('deleteAccount()', () => {
    it('should not delete a Bank Account with invalid ID', () => {
      const testId = '';
      expect(() => bankAccountDomain.deleteAccount(testId)).to.throw(
        Error,
        'id must be provided'
      );
    });

    it('should delete an account', () => {
      const testId = '1';
      bankAccountDomain.projections.add(new BankAccount(testId, 100));
      bankAccountDomain.deleteAccount(testId);
    });
    it('should not delete an unknown account', () => {
      const testId = '1';
      expect(() => bankAccountDomain.deleteAccount(testId)).to.throw(Error, '');
    });
  });

  describe('apply()', () => {
    it('should work with nothing', () => {
      bankAccountDomain.apply();
    });
  });

  describe('fromScratch()', () => {
    it('should work with nothing', () => {
      bankAccountDomain.fromScratch();
    });
    it('should work with a list of events', () => {
      const testId = '1';
      bankAccountDomain.fromScratch([
        new BankAccountCreated(testId),
        new BankAccountCredited(testId, 100),
        new BankAccountDebited(testId, 70)
      ]);
      const account = bankAccountDomain.getAccount(testId);
      expect(account.balance).to.equal(30);
      expect(account.id.value).to.equal(testId);
      expect(account.blockCountdown).to.equal(3);
      expect(account.blockedUntil).to.be.undefined;
    });
  });
});
