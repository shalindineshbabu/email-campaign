import fs from 'fs';
import moment from 'moment';
import exists from 'file-exists';
import { basename, resolve } from 'path';

export default function data(opts) {
	const dirs = {};
	const metadata = {};
	const { sitedir , assetsdir, version } = Object.assign({
      sitedir: opts || { sitedir: 'site' },
      assetsdir: 'assets',
      version: moment().format('YYYYMMDD'),
    }, opts );

	['common', sitedir].forEach((dir) => {
      dirs[dir] = {
        data: `${dir}/data`,
      }
    });

	return (files, metalsmith, done) => {

		/**
	    * Add global metadata to all files
	    */
	    ['settings'].forEach((filename) =>{
	    metadata[filename] = (exists(`${dirs[sitedir].data}/${filename}.json`)) ? {
		  ...parse(`${dirs.common.data}/${filename}.json`),
	      ...parse(`${dirs[sitedir].data}/${filename}.json`)
	    } : metadata[filename] = parse(`${dirs.common.data}/${filename}.json`);
	    });

	    metalsmith.metadata(metadata);

		// add metadata to pug files
		function addMeta(filename) {
			// set default locale
			let locale = files[filename].locale || 'en';

			if (filename.match(/\.pug$/i)) {
				files[filename].locale = locale;
				files[filename].version = version;
				files[filename].assetsdir = assetsdir;
			}

			// handle frontmatter i18n option
	        if (files[filename].i18n) {
	          files[filename].i18n = exists(`${dirs[sitedir].data}/${locale}/${files[filename].i18n}`) ?
	            parse(`${dirs[sitedir].data}/${locale}/${files[filename].i18n}`)
	          : parse(`${dirs.common.data}/${locale}/${files[filename].i18n}`);
	        }

			// add site.json i18n data, pug file overwrites site data
	        files[filename].i18n = exists(`${dirs[sitedir].data}/${locale}/site.json`) ? {
	          ...parse(`${dirs[sitedir].data}/${locale}/site.json`),
	          ...files[filename].i18n
	        } : {
	          ...parse(`${dirs.common.data}/${locale}/site.json`),
	          ...files[filename].i18n
	        }

		}

		/**
	    * Output error and debug messages
	    */
	    function debug(message) {
	      process.stdout.write(message);
	    }

		/**
	    * Parse data file if it exists
	    */
	    function parse(file) {
	      try {
	        const stat = fs.statSync(file);
	        if (!stat.isFile()) {
	          debug('file "' + file + '" not found');
	          return {};
	        }
	        return JSON.parse(fs.readFileSync(file));
	      } catch (err) {
	        debug(err);
	        return {};
	      }
	    }

		// add common src files into build
	    metalsmith.read(resolve('common/src'), (err, common) => {
	      if (err) console.error(err);

	      Object.keys(
	        Object.assign(files, Object.assign(common, files))
	      ).forEach(addMeta);

	      done()
	    })
	}
}
