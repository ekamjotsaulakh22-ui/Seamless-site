(function(){
  document.querySelectorAll('[data-ba]').forEach((wrap)=>{
    const range = wrap.querySelector('input[type="range"]');
    const after = wrap.querySelector('.after');
    if(!range || !after) return;
    const set = () => {
      const v = parseInt(range.value, 10);
      after.style.clipPath = `inset(0 ${100-v}% 0 0)`;
    };
    range.addEventListener('input', set);
    set();
  });
})();
