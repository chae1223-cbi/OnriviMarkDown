const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { createElement } = React;
// We'd need to compile jsx, let's just write a plain node script without react if possible, or use tsx.
