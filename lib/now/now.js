/**
* @module lib/now/now
* @description handles now presentation creation.
**/

'use strict';

const logger = require('logger-asq');
const Promise = require("bluebird");
const coroutine = Promise.coroutine;
const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const fsUtils = require('../utils/fs.js');
const Slide2html = require('../../slide2html').default;
const socketEmitter = require('../../lib/socket/pubsub');
const Slideshow = db.model('Slideshow');
const liveApp = require('../upload/liveApp');
const upload = require('../upload/upload');
const presentationCreate = require('../presentation/presentationCreate.js');
const nowTemplateDir = path.resolve(__dirname, '../support/now/');

module.exports = {

	createPresentationFromNowHtml: async function (owner_id, name, exerciseMarkup) {

		let slideshow = await presentationCreate.createBlankSlideshow(owner_id, name, 'reveal.js');

		const presentationDir = slideshow.path;

		//copy your skeleton files from /lib/support/now
		await this.addNowBoilerplateFiles(slideshow)

		// copy exercise code inside the presentation
		await this.injectExerciseMarkup(exerciseMarkup, presentationDir)

		await liveApp.addLiveAppFiles(presentationDir);
		await upload.findAndProcessMainFile(slideshow._id);

		return slideshow._id;
	},


	injectExerciseMarkup:async function(exerciseMarkup, presentationDir){
		var presentationHtml = await fs.readFile(`${nowTemplateDir}/skeleton_index.html`);

		// reading the content of the skeleton_index.html file
		var $ = cheerio.load(presentationHtml,{
      decodeEntities: false,
      lowerCaseAttributeNames:false,
      lowerCaseTags:false,
      recognizeSelfClosing: true
    });

		// appending the markup for the exercise into a one-slide presentation
		$('#m-slide-0').append(exerciseMarkup);

		// writing the markup to the file, save it under index.html in dest folder
		return fs.writeFile(`${presentationDir}/index.html`, $.root().html());
	},


	addNowBoilerplateFiles: async function (slideshow) {

		// list the files in lib/support/now and copy them for a new presentation
		const items = await fs.readdir(nowTemplateDir)

		// filter files to copy, we don't want skeleton_index.html
		const filteredItems = items.filter(item => item != 'skeleton_index.html');

		// copy all files from support/now to slideshow directory
		return Promise.map(filteredItems, file => {
			const src = path.resolve(__dirname, nowTemplateDir, file);
			const dest = path.resolve( slideshow.path, file);
			fs.copy(src, dest)
		});

	},
}