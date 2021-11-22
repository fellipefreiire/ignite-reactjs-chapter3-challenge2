export const Comments: React.FC = () => (
  <section
    ref={elem => {
      if (!elem) {
        return;
      }
      const scriptElem = document.createElement('script');
      scriptElem.src = 'https://utteranc.es/client.js';
      scriptElem.async = true;
      scriptElem.crossOrigin = 'anonymous';
      scriptElem.setAttribute(
        'repo',
        'fellipefreiire/ignite-reactjs-chapter3-challenge2'
      );
      scriptElem.setAttribute('issue-term', 'pathname');
      scriptElem.setAttribute('label', 'blog-comment');
      scriptElem.setAttribute('theme', 'github-dark');
      elem.appendChild(scriptElem);
    }}
  />
);
