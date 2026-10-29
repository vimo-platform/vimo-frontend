const assert = require('node:assert/strict');
const { test } = require('node:test');
const { load, createHarness } = require('./helpers/timetable-harness.cjs');

function mountScreen({ phase = 'loading', analysis = null, keywords = [], request, save } = {}) {
  const h = createHarness();
  const state = [phase, analysis, keywords, false, '', false, 0, false];
  const timers = [], alerts = [], routes = [], recommendations = [];
  let effects, index, tree, requestCount = 0, saveCount = 0;
  const jsx = (type, props) => ({ type, props });
  const react = {
    useEffect: (fn) => effects.push(fn), useMemo: (fn) => fn(),
    useState: (initial) => {
      const slot = index++;
      if (!(slot in state)) state[slot] = typeof initial === 'function' ? initial() : initial;
      return [state[slot], (value) => { state[slot] = typeof value === 'function' ? value(state[slot]) : value; }];
    },
  };
  const api = {
    analyzeScheduleImage: (...args) => { requestCount++; return request ? request(...args) : Promise.resolve(h.result); },
    getSavedScheduleAnalysis: async () => null,
    saveScheduleAnalysisSelection: (...args) => { saveCount++; return save ? save(...args) : Promise.resolve(); },
  };
  const screen = load('src/screens/exploration/ScheduleAnalysisScreen.tsx', {
    'react/jsx-runtime': { jsx, jsxs: jsx }, react,
    'expo-router': { router: { replace: (route) => routes.push(route) }, useLocalSearchParams: () => ({ imageUri: 'file:///timetable.png' }) },
    'react-native': {
      Alert: { alert: (...args) => alerts.push(args) }, Animated: { Value: class { setValue() {} }, View: 'AnimatedView' },
      Easing: {}, Image: 'Image', ScrollView: 'ScrollView', Text: 'Text', View: 'View',
      StyleSheet: { create: (style) => style }, useWindowDimensions: () => ({ width: 393 }),
    },
    'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' },
    '@/components/common': { Button: 'Button', Tag: 'Tag' },
    '@/components/common/LoadingOverlay': { LoadingOverlay: 'LoadingOverlay', LOADING_FILL_DURATION_MS: 5500 },
    '@/hooks/common/use-user-session-guard': { useUserSessionGuard: () => {} },
    '@/services/common/client': h.client,
    '@/services/exploration/schedule-analysis-errors': h.errors,
    '@/services/exploration/schedule-analysis-api': api,
    '@/services/exploration/customized-recommendation-store': { setScheduleRecommendationFromAnalysis: (value) => recommendations.push(value) },
    '@/assets/images/explorationimg/explorationstar.png': 1,
  }, {
    setTimeout: (fn, duration) => {
      const timer = { fn, duration, cleared: false }; timers.push(timer);
      if (duration === 5500) fn();
      return timer;
    },
    clearTimeout: (timer) => { if (timer) timer.cleared = true; },
  });
  function render() {
    effects = []; index = 0;
    const element = screen.ScheduleAnalysisScreen();
    tree = element.type(element.props);
    return tree;
  }
  render();
  return { h, state, timers, alerts, routes, recommendations, render,
    get tree() { return tree; }, get effects() { return effects; },
    get requestCount() { return requestCount; }, get saveCount() { return saveCount; },
  };
}
function button(tree, label) {
  if (!tree || typeof tree !== 'object') return undefined;
  if (tree.type === 'Button' && tree.props.label === label) return tree;
  const children = tree.props?.children;
  for (const child of Array.isArray(children) ? children : [children]) {
    const found = button(child, label); if (found) return found;
  }
}
const settle = () => new Promise(setImmediate);

test('failed OCR renders retry/reselect actions instead of a completed blank timetable', async () => {
  const ui = mountScreen({ request: async () => { throw new Error('Unsupported FormDataPart implementation'); } });
  ui.effects[0](); await settle(); ui.render();
  assert.equal(ui.state[0], 'error');
  assert.equal(ui.state[1], null);
  assert.ok(button(ui.tree, '다시 시도'));
  assert.ok(button(ui.tree, '사진 다시 선택'));
  assert.equal(button(ui.tree, '다음'), undefined);
  button(ui.tree, '사진 다시 선택').props.onPress();
  assert.equal(ui.routes[0], '/schedule-register');
});

test('retry repeats analysis and success can display the newly returned classes', async () => {
  let attempt = 0;
  const h = createHarness();
  const ui = mountScreen({ request: async () => { if (!attempt++) throw new Error('network'); return h.result; } });
  ui.effects[0](); await settle(); ui.render();
  button(ui.tree, '다시 시도').props.onPress();
  assert.equal(ui.state[0], 'loading');
  ui.render(); ui.effects[0](); await settle(); ui.render();
  assert.equal(ui.requestCount, 2);
  assert.equal(ui.state[0], 'complete');
  assert.equal(ui.state[1].classes[0].subjectName, '자료구조');
  assert.ok(button(ui.tree, '다음'));
});

test('a request that never resolves times out and can be retried', async () => {
  const ui = mountScreen({ request: () => new Promise(() => {}) });
  ui.effects[0]();
  ui.timers.find((timer) => timer.duration === 60_000).fn();
  await settle(); ui.render();
  assert.equal(ui.state[0], 'error');
  assert.match(ui.state[4], /오래 걸리고/);
  assert.ok(button(ui.tree, '다시 시도'));
});

test('leaving the screen aborts its request and does not apply a late result', async () => {
  let resolve, signal;
  const ui = mountScreen({ request: (_uri, requestSignal) => { signal = requestSignal; return new Promise((done) => { resolve = done; }); } });
  const cleanup = ui.effects[0](); cleanup();
  assert.equal(signal.aborted, true);
  resolve(ui.h.result); await settle();
  assert.equal(ui.state[1], null);
  assert.ok(ui.timers.every((timer) => timer.cleared));
});

test('save failure preserves selections and never navigates or updates local recommendations', async () => {
  const h = createHarness();
  const ui = mountScreen({ phase: 'complete', analysis: h.result, keywords: ['IT'], save: async () => { throw new Error('server down'); } });
  await button(ui.tree, '다음').props.onPress();
  assert.equal(ui.alerts.length, 1);
  assert.equal(ui.routes.length, 0);
  assert.equal(ui.recommendations.length, 0);
  assert.deepEqual(ui.state[2], ['IT']);
  assert.equal(ui.state[7], false);
});

test('successful save alone updates recommendations and opens exploration', async () => {
  const h = createHarness();
  const ui = mountScreen({ phase: 'complete', analysis: h.result, keywords: ['IT'] });
  await button(ui.tree, '다음').props.onPress();
  assert.equal(ui.saveCount, 1);
  assert.equal(ui.recommendations.length, 1);
  assert.deepEqual(ui.routes, ['/search']);
});

test('expired authentication shows a login action instead of retrying with a missing token', async () => {
  const ui = mountScreen({ request: async () => { throw new ui.h.client.ApiError(401, 'expired'); } });
  ui.effects[0](); await settle(); ui.render();
  assert.equal(ui.state[0], 'error');
  assert.ok(button(ui.tree, '다시 로그인'));
  assert.equal(button(ui.tree, '다시 시도'), undefined);
  button(ui.tree, '다시 로그인').props.onPress();
  assert.deepEqual(ui.routes, ['/']);
});
