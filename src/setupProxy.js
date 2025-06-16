const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/platform',
    createProxyMiddleware({
      target: 'https://api.rd.services',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onProxyRes: function(proxyRes, req, res) {
        console.log('Proxy Response:', {
          statusCode: proxyRes.statusCode,
          headers: proxyRes.headers,
          url: req.url
        });
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      },
      onError: function(err, req, res) {
        console.error('Proxy Error:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('Erro no proxy: ' + err.message);
      }
    })
  );

  app.use(
    '/rd',
    createProxyMiddleware({
      target: 'http://localhost:4000',
      changeOrigin: true,
      logLevel: 'debug',
      pathRewrite: {
        '^/rd': ''
      }
    })
  );

  app.use(
    '/lead',
    createProxyMiddleware({
      target: 'http://localhost:4000',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      pathRewrite: {
        '^/lead': '/lead'
      },
      onProxyReq: function(proxyReq, req, res) {
        console.log('Proxy Request:', {
          method: req.method,
          url: req.url,
          headers: req.headers
        });
      },
      onProxyRes: function(proxyRes, req, res) {
        console.log('Proxy Response:', {
          statusCode: proxyRes.statusCode,
          headers: proxyRes.headers,
          url: req.url
        });
      },
      onError: function(err, req, res) {
        console.error('Proxy Error:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('Erro no proxy');
      }
    })
  );
}; 