(function () {
    var body = document.body.textContent;
    // if (body.match(/(?:\$|\\\(|\\\[|\\begin\{.*?})/)) {
    if (body.match(/(?:\$\$)/)) {
        if (!window.MathJax) {
            window.MathJax = {
                tex2jax: {
                    inlineMath: [['$','$'], ['\\(','\\)']]
                }
            };
        }
        var script1 = document.createElement('script');
        script1.src = 'https://polyfill.io/v3/polyfill.min.js?features=es6';
        document.head.appendChild(script1);
        var script2 = document.createElement('script');
        script2.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
        document.head.appendChild(script2);
    }
})();