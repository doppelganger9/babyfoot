import { generateUUID } from './id-generator';
import { describe, expect, it } from 'vitest';

describe('idGenerator', () => {
  it('When generate several id Then return always different id', () => {
    const id1 = generateUUID();
    const id2 = generateUUID();

    expect(id1).not.to.equal(id2);
  });
});
