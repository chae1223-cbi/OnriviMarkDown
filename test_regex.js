console.log(new RegExp(`(<h[1-3]\\b[^>]*>)`, 'gi').test('<h3>'));
console.log(new RegExp(`(<h[1-3]\\b[^>]*>)`, 'gi').test('<h3 id="foo">'));
