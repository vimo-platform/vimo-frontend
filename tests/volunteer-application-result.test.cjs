const assert = require('node:assert/strict');
const { before, test } = require('node:test');

let getApplicationOutcome;
before(async () => {
  ({ getApplicationOutcome } = await import('../src/services/exploration/application-result.ts'));
});

for (const application of [{ status: 'APPROVED' }, { status: 'PENDING' }, undefined]) {
  test(`first-come application always confirms: ${JSON.stringify(application)}`, () => {
    assert.equal(getApplicationOutcome('fcfs', application), 'confirmed');
  });
}

for (const recruitType of [undefined, 'selection']) {
  test(`server approval overrides missing/stale recruitment type: ${recruitType}`, () => {
    assert.equal(getApplicationOutcome(recruitType, { status: 'APPROVED' }), 'confirmed');
  });
}

test('selection application remains pending until approved', () => {
  assert.equal(getApplicationOutcome('selection', { status: 'PENDING' }), 'pending');
});

test('server pending status is recognized when recruitment metadata is missing', () => {
  assert.equal(getApplicationOutcome(undefined, { status: 'PENDING' }), 'pending');
});

test('applicationStatus is accepted and takes precedence over status', () => {
  assert.equal(getApplicationOutcome(undefined, { applicationStatus: 'APPROVED', status: 'PENDING' }), 'confirmed');
});

for (const application of [undefined, {}, { status: 'REJECTED' }]) {
  test(`unknown result never defaults to selection completion: ${JSON.stringify(application)}`, () => {
    assert.equal(getApplicationOutcome(undefined, application), 'unknown');
    assert.equal(getApplicationOutcome('selection', application), 'unknown');
  });
}
