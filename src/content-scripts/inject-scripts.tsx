import Browser from 'webextension-polyfill';

const addScript = (url: string) => {
  const container = document.head || document.documentElement;
  const scriptTag = document.createElement('script');
  scriptTag.setAttribute('async', 'false');
  scriptTag.setAttribute('src', Browser.runtime.getURL(url));
  container.appendChild(scriptTag);
  scriptTag.onload = () => scriptTag.remove();
};

addScript('js/vendor.js');
addScript('js/injected/proxy-injected-providers.js');
