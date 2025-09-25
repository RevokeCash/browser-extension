(() => {
  try {
    const back = document.getElementById('back');
    const proceed = document.getElementById('proceed');
    if (back)
      back.onclick = () => {
        try {
          history.length > 1 ? history.back() : location.replace('https://google.com');
        } catch {
          location.replace('https://google.com');
        }
      };
    if (proceed)
      proceed.onclick = () => {
        try {
          history.length > 1 ? history.back() : location.replace('about:blank');
        } catch {
          location.replace('about:blank');
        }
      };
  } catch {}
})();
