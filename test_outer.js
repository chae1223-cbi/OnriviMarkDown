const { JSDOM } = require("jsdom");
const dom = new JSDOM(`<div><h1>Hello</h1></div>`);
const h1 = dom.window.document.querySelector('h1');
h1.style.setProperty('break-before', 'page', 'important');
console.log(dom.window.document.body.innerHTML);
