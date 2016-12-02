'use strict';

require('dotenv').config({path: 'devops.env'});
const Promise = require('bluebird');

var args = process.argv.slice(2);

if(!args[0]){
	console.log("You should pass the branch name as parameter");
	return;
}

let dockerHubAPI = require('docker-hub-api');
let username = process.env.DOCKER_HUB_DEV_USERNAME;
let password = process.env.DOCKER_HUB_DEV_PASSWORD;
let dockerHubRepo = process.env.DOCKER_HUB_DEV_REPO;
let branchName = args[0];

//Enables the cache, because we need to issue the tag request twice, due to the fact
//there is not an API dedicated to check the number of tag pages
dockerHubAPI.setCacheOptions({enabled: true});

dockerHubAPI.login(username, password).then(function(info) {
    console.log("Logged in to Docker Hub with user: " + username);
    const loginToken = info.token;
    dockerHubAPI.setLoginToken(loginToken);

    //Collects all the tags matching the branch we want to delete, and delete them
    dockerHubAPI.loggedInUser().then(function () {

    	let options = {page: 1, perPage: 100};

    	//Iterate the pages and delete the tags
    	let getPage = function(){

 				//Get the tags
				dockerHubAPI.tags(username,dockerHubRepo,options).then(function (tags) {

						//Deletes all the image tags containing the branchName
						for(let tag = 0; tag < tags.length; tag++){
							if(tags[tag].name.startsWith(branchName)){
								dockerHubAPI.deleteTag(username,dockerHubRepo,tags[tag].name);
								console.log('Tag deleted: ' + tags[tag].name);
							}
						}

						options.page = options.page + 1;

						getPage();

				}).catch(function(reason) {
					 console.log("Done deleting the tags");
				});
    	}

    	getPage();

		});
});