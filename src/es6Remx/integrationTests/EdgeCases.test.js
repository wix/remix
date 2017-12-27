describe(`EdgeCases`, () => {
  let remx, mobx;
  let state, setters, getters, anotherState;

  beforeEach(() => {
    mobx = require('mobx');
    remx = require('../remx');

    anotherState = remx.state({
      count: 0
    });

    state = remx.state({
      obj: {
        foo: 'bar'
      }
    });
    setters = remx.setters({
      modify() {
        state.anotherState = anotherState;
        anotherState.count++;
      },
      add(o) {
        state.added = { o };
      }
    });
    getters = remx.getters({
      getCount() {
        return state.anotherState ? state.anotherState.count : -1;
      }
    });
  });

  it('support setting partial remx state inside another state', () => {
    const state1 = remx.state({ obj1: { arr1: [] } });
    const state2 = remx.state({});

    const getter1 = remx.getters({ getObj1: () => state1.obj1 });
    const setter2 = remx.setters({ set: () => state2.someProp = getter1.getObj1() });

    let callCount = 0;
    const stop = mobx.autorun(() => {
      JSON.stringify(getter1.getObj1());
      callCount++;
    });
    expect(callCount).toEqual(1);
    setter2.set();
    expect(callCount).toEqual(1);
    stop();
  });

  it('support observing on observable objects (remx state inside remx state)', () => {
    const runs = [];
    const stop = mobx.autorun(() => {
      runs.push(getters.getCount());
    });

    expect(getters.getCount()).toEqual(-1);
    setters.modify();
    expect(getters.getCount()).toEqual(1);
    setters.modify();
    expect(anotherState.count).toEqual(2);

    stop();

    expect(runs).toEqual([-1, 1, 2]);
  });

  it('supports cyclic objects', () => {
    const obj = { a: { b: { c: {} } } };
    obj.a.b.c = obj;

    expect(() => setters.add(obj)).not.toThrow();
  });
});

describe('prod test', () => {
  it('does not throw mutation in production', () => {
    global.__DEV__ = false;
    const remx = require('../remx');
    const mobx = require('mobx');

    const state = remx.state({ obj: {} });

    const stop = mobx.autorun(() => {
      expect(state.obj).toBeDefined();
    });
    expect(() => state.obj = 1).not.toThrow();
    stop();
  });

  it('does not throw mutation in production2', () => {
    const origProcess = process;
    process = { env: { NODE_ENV: 'prod' } };  // eslint-disable-line no-global-assign

    const remx = require('../remx');
    const mobx = require('mobx');

    const state = remx.state({ obj: {} });

    const stop = mobx.autorun(() => {
      expect(state.obj).toBeDefined();
    });
    expect(() => state.obj = 1).not.toThrow();
    stop();
    process = origProcess; // eslint-disable-line no-global-assign
  });
});
