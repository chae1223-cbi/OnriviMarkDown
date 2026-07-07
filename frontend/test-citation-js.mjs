import { Cite, plugins } from '@citation-js/core';
import '@citation-js/plugin-bibtex';

const run = () => {
  const c = new Cite('@article{smith2023, title={Test}}');
  console.log(c.format('bibliography', {format:'html', template:'apa'}));
};
run();
