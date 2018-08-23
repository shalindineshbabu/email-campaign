import assets from 'metalsmith-copy-assets-540';
import metalsmith from 'metalsmith';
import inplace from 'metalsmith-in-place';
import layouts from 'metalsmith-layouts';
import serve from 'metalsmith-serve';
import watch from 'metalsmith-watch';

import config from './config';
import data from './lib/data';

// default plugins
let middleware = [
    assets(config.assets.images),
    data(config.data),
    layouts(config.layouts),
    inplace(config.inplace)
]

// merge development plugins
if (process.env.NODE_ENV === 'development') {
  middleware = [
    watch(config.watch),
    serve(config.serve),
    ...middleware
  ]
}

// add plugins to metalsmith
const site = middleware.reduce((site, middleware) => {
  return site.use(middleware);
}, metalsmith(__dirname)
  .source(config.metalsmith.source)
  .destination(config.metalsmith.destination)
)

// build
site.build(function(err, files) {
  if (err) console.error(err);
});
