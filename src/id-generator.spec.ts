import { generateUUID } from './id-generator';
import { expect } from 'chai';

describe('idGenerator', function() {
  it('When generate several id Then return always different id', function() {
    const id1 = generateUUID();
    const id2 = generateUUID();

    expect(id1).not.to.equal(id2);
  });
});
