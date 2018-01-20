import { ValueType } from './value-type';
import { expect } from 'chai';

describe('ValueType', () => {
  describe('Given value type When create an instance of this type', () => {
    const id = 'idA';
    const value = 'A';

    class ValueA extends ValueType {
      id: string;
      value: string;
      constructor(id: string, value: string) {
        super();
        this.id = id;
        this.value = value;
      }
      toString() {
        return 'Id:' + this.id;
      }
    }

    const instance = new ValueA(id, value);

    it('Then call constructor', () => {
      expect(instance.id).to.equal(id);
      expect(instance.value).to.equal(value);
    });

    it('Then toString call good function', () => {
      const result = instance.toString();

      expect(result).to.equal('Id:' + id);
    });

    it('Then can compare with other instance with same representation', () => {
      const instanceWithSameData = new ValueA(id, value);
      const instanceWithoutSameData = new ValueA(id + '2', value);

      expect(instance.equals(instanceWithSameData)).to.be.true;
      expect(instance.equals(instanceWithoutSameData)).to.be.false;
    });

    it('Then can compare with null ou undefined value', () => {
      expect(instance.equals(null)).to.be.false;
      expect(instance.equals(undefined)).to.be.false;
    });
  });
});
