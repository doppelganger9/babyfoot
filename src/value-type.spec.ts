import { ValueType } from './value-type';
import { expect } from 'chai';

describe('ValueType', () => {
  describe('Given value type When create an instance of this type', () => {
    const _id = 'idA';
    const _value = 'A';

    class ValueA extends ValueType {
      constructor(public id: string, public value: string) {
        super();
      }
      public toString() {
        return 'Id:' + this.id;
      }
    }

    const instance = new ValueA(_id, _value);

    it('Then call constructor', () => {
      expect(instance.id).to.equal(_id);
      expect(instance.value).to.equal(_value);
    });

    it('Then toString call good function', () => {
      const result = instance.toString();

      expect(result).to.equal('Id:' + _id);
    });

    it('Then can compare with other instance with same representation', () => {
      const instanceWithSameData = new ValueA(_id, _value);
      const instanceWithoutSameData = new ValueA(_id + '2', _value);

      expect(instance.equals(instanceWithSameData)).to.be.true;
      expect(instance.equals(instanceWithoutSameData)).to.be.false;
    });
  });
});
