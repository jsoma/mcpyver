(function(){
  var matched = location.pathname.match(/\/(manual\/.*?\/.*\.html)$/);
  if (!matched) return;

  var currentName = matched[1];
  var cssClass = '.navigation .manual-toc li[data-link="' + currentName + '"]';
  var styleText = cssClass + '{ display: block; }\n';
  var style = document.createElement('style');
  style.textContent = styleText;
  document.querySelector('head').appendChild(style);
})();
