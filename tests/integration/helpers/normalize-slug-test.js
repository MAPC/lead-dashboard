
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('normalize-slug', 'helper:normalize-slug', {
  integration: true
});

// Replace this with your real tests.
test('it renders', function(assert) {
  this.set('inputValue', '1234');

  this.render(hbs`{{normalize-slug inputValue}}`);

  assert.equal(this.$().text().trim(), '1234');
});

