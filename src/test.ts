import test from 'ava';
import { hello } from './index';

test('it hellos', t => {
  t.is(hello(), "hello, world");
});
