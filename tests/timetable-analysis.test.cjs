const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createHarness } = require('./helpers/timetable-harness.cjs');

test('regression: Expo rejects the previous URI object before transport', async () => {
  const h = createHarness();
  const form = new h.FormData();
  form.append('file', { uri: 'file:///timetable.png', name: 'timetable.jpg', type: 'image/jpeg' });
  await assert.rejects(h.converter.convertFormDataAsync(form), /Unsupported FormDataPart/);
});

for (const format of ['png', 'jpg']) {
  test(`native ${format} reaches transport through the actual Expo encoder with correct bytes and MIME`, async () => {
    const h = createHarness();
    const analysis = await h.api.analyzeScheduleImage(`file:///timetable.${format}`);
    assert.equal(analysis.classes[0].subjectName, '자료구조');
    assert.equal(analysis.scheduleItems[0].time, '09:00 - 10:30');
    assert.equal(h.transport.length, 1);
    assert.equal(h.conversions.length, 0);
    const wire = h.transport[0].body.toString();
    assert.match(wire, /name="file"/);
    assert.ok(wire.includes(`filename="timetable.${format}"`));
    assert.ok(wire.includes(format === 'png' ? 'image/png' : 'image/jpeg'));
    const original = await new h.NativeFile(`file:///timetable.${format}`).bytes();
    assert.notEqual(h.transport[0].body.indexOf(original), -1);
    assert.equal(h.requests[0].headers.Authorization, 'Bearer test-token');
    assert.equal(h.requests[0].headers['Content-Type'], undefined);
    assert.match(h.transport[0].headers[0][1], /^multipart\/form-data; boundary=/);
  });
}

test('native HEIC is converted to actual JPEG before upload and native image handles are released', async () => {
  const h = createHarness();
  await h.api.analyzeScheduleImage('file:///timetable.heic');
  assert.match(h.transport[0].body.toString(), /image\/jpeg/);
  assert.match(h.transport[0].body.toString(), /converted jpeg bytes/);
  assert.ok(h.conversions.some(([stage]) => stage === 'save'));
  assert.ok(h.conversions.some(([stage]) => stage === 'image released'));
  assert.ok(h.conversions.some(([stage]) => stage === 'context released'));
});

for (const [uri, message] of [['file:///empty.png', /비어/], ['file:///large.png', /10MB/], ['file:///missing.png', /다시 선택/], [undefined, /먼저 선택/]]) {
  test(`invalid image is rejected before OCR request: ${uri}`, async () => {
    const h = createHarness();
    await assert.rejects(h.api.analyzeScheduleImage(uri), message);
    assert.equal(h.transport.length, 0);
    assert.equal(h.requests.length, 0);
  });
}

for (const status of [401, 413, 422, 500]) {
  test(`HTTP ${status} is propagated instead of turning into a successful blank timetable`, async () => {
    const h = createHarness({ httpStatus: status });
    await assert.rejects(h.api.analyzeScheduleImage('file:///timetable.png'), (error) => error.status === status);
  });
}

test('network error is propagated', async () => {
  const failure = new TypeError('Network failed');
  const h = createHarness({ networkError: failure });
  await assert.rejects(h.api.analyzeScheduleImage('file:///timetable.png'), (error) => error === failure);
});

for (const ocrResult of [{}, { classes: [], freeTimeSlots: [] }, { classes: [{ subjectName: 'bad' }], freeTimeSlots: [] }]) {
  test(`invalid/empty OCR result is rejected: ${JSON.stringify(ocrResult)}`, async () => {
    const h = createHarness({ ocrResult });
    await assert.rejects(h.api.analyzeScheduleImage('file:///timetable.png'), /결과|수업 정보/);
  });
}

test('LocalTime objects remain supported', async () => {
  const h = createHarness({ ocrResult: {
    classes: [{ subjectName: '자료구조', dayOfWeek: 'MONDAY', startTime: { hour: 9, minute: 0 }, endTime: { hour: 10, minute: 30 } }],
    freeTimeSlots: [],
  } });
  assert.equal((await h.api.analyzeScheduleImage('file:///timetable.png')).scheduleItems[0].time, '09:00 - 10:30');
});

test('save errors are propagated and invalid analysis cannot overwrite free-time slots', async () => {
  const h = createHarness({ saveError: true });
  const analysis = await h.api.analyzeScheduleImage('file:///timetable.png');
  await assert.rejects(h.api.saveScheduleAnalysisSelection(analysis, ['IT']), (error) => error.status === 500);
  const before = h.requests.length;
  await assert.rejects(h.api.saveScheduleAnalysisSelection(null, ['IT']), /분석/);
  await assert.rejects(h.api.saveScheduleAnalysisSelection({ classes: [] }, ['IT']), /분석/);
  assert.equal(h.requests.length, before);
});

test('web uses a PNG Blob with matching filename, and an unreadable image fails before OCR', async () => {
  const h = createHarness({ platform: 'web' });
  await h.api.analyzeScheduleImage('blob:photo');
  assert.match(h.transport[0].body.toString(), /filename="timetable.png"/);
  assert.match(h.transport[0].body.toString(), /image\/png/);
  const bad = createHarness({ platform: 'web', unreadableAsset: true });
  await assert.rejects(bad.api.analyzeScheduleImage('blob:missing'), /열지 못/);
  assert.equal(bad.requests.length, 0);
});

test('saved-screen errors can be surfaced while exploration keeps its optional fallback', async () => {
  const h = createHarness({ httpStatus: 401 });
  assert.equal(await h.api.getSavedScheduleAnalysis(), null);
  await assert.rejects(h.api.getSavedScheduleAnalysis({ throwOnError: true }), (error) => error.status === 401);
});

test('server OCR error messages and expired login are explained without implementation details', () => {
  const h = createHarness();
  assert.match(h.errors.getScheduleAnalysisErrorMessage(new h.client.ApiError(401, 'unauthorized')), /로그인/);
  assert.equal(h.errors.getScheduleAnalysisErrorMessage(new h.client.ApiError(422, '{"message":"격자선을 찾지 못했어요."}')), '격자선을 찾지 못했어요.');
  assert.ok(!h.errors.getScheduleAnalysisErrorMessage(new Error('Unsupported FormDataPart implementation')).includes('FormData'));
});

test('single-digit hours normalize to HH:mm without trailing colons', async () => {
  const h = createHarness({ ocrResult: {
    classes: [{ subjectName: '자료구조', dayOfWeek: 'MONDAY', startTime: '9:00:00', endTime: '10:30:00' }],
    freeTimeSlots: [],
  } });
  assert.equal((await h.api.analyzeScheduleImage('file:///timetable.png')).scheduleItems[0].time, '09:00 - 10:30');
});
