(function(){
  const y = document.querySelectorAll('[data-year]');
  const year = new Date().getFullYear();
  y.forEach(el => el.textContent = year);
})();
