/* Páginas de serviço e de cliente: revelar ao rolar, letreiro vivo, print que rola e botão do WhatsApp no celular. */
(function () {
  var doc = document.documentElement;
  doc.classList.add('js');
  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Revelar ao rolar (600ms), uma vez só
  var els = [].slice.call(document.querySelectorAll('.reveal'));
  if (calmo || !('IntersectionObserver' in window)) {
    els.forEach(function (e) { e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      if (!els.some(function (e) { return !e.classList.contains('in'); })) io.disconnect();
    }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
    els.forEach(function (e) { io.observe(e); });
  }

  // Print do site: no hover a tela rola até o fim
  function mede() {
    [].forEach.call(document.querySelectorAll('.jan'), function (j) {
      var sc = j.querySelector('.jan-scr'), img = j.querySelector('img');
      if (sc && img) j.style.setProperty('--shift', Math.min(0, sc.clientHeight - img.offsetHeight) + 'px');
    });
  }
  window.addEventListener('load', mede);
  window.addEventListener('resize', mede);

  // Letreiro: de vez em quando uma letra pisca ou a placa troca rosa/azul
  var marca = document.querySelector('.marca');
  if (marca && !calmo) {
    var letras = [].slice.call(marca.querySelectorAll('.word:not(.sub) > span'));
    var t = null;
    var vez = function () {
      if (Math.random() < .35) marca.classList.toggle('azul');
      else {
        var l = letras[Math.floor(Math.random() * letras.length)];
        l.classList.remove('pisca'); void l.offsetWidth; l.classList.add('pisca');
      }
      agenda();
    };
    var agenda = function () { t = setTimeout(vez, 2600 + Math.random() * 3400); };
    document.addEventListener('visibilitychange', function () {
      clearTimeout(t);
      if (!document.hidden) agenda();
    });
    setTimeout(agenda, 1300);
  }

  // Botão verde do WhatsApp: aparece no celular depois do topo da página
  var wa = document.querySelector('.wa'), cab = document.querySelector('.cabeca');
  if (wa && cab && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      wa.classList.toggle('on', !es[0].isIntersecting);
    }).observe(cab);
  }
})();
