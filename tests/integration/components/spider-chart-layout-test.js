import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('spider-chart-layout', 'Integration | Component | spider chart layout', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{spider-chart-layout}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#spider-chart-layout}}
      template block text
    {{/spider-chart-layout}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
