import moment from 'moment';
import minimist from 'minimist';

const { sitedir, version } = minimist(process.argv, {
  alias: { s: 'sitedir', v: 'version' },
  default: { s: 'site', v: moment().format('YYYYMMDD') },
});

const assetsdir = 'assets';
const destination = `build`;
const source = './src';

export default {
    assets: {
      images: {
        dest: `${assetsdir}/images/`,
        src: [`${sitedir}/${assetsdir}/images`]
      }
    },
    data: {
      assetsdir: assetsdir,
      sitedir: sitedir,
      version: version,
    },
    inplace: {
      pattern: '**/*.pug',
    },
    layouts: {
      default: 'layout.pug',
      directory: 'templates',
      partials: "templates/includes",
      engine: 'pug',
      pattern: '**/*.pug',
      rename: true
    },
    metalsmith: {
      destination: destination,
      source: source,
      metadata: { sitedir: sitedir }
    },
    serve: {
      port: process.env.PORT || 8080,
    },
    watch: {
      livereload: true,
      invalidateCache: true,
      paths: {
        [`${source}/**/*`]: true,
        'templates/**/*.pug': '**/*',
        'data/**/**/*.json': '**/*'
      },
    }
}
