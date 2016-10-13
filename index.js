"use strict";
const AWS = require('aws-sdk');
const fs = require('fs');

const credentials = new AWS.SharedIniFileCredentials({profile: 'jruffin-profile'});
AWS.config.credentials = credentials;

const iam = new AWS.IAM();

if (typeof Promise === 'undefined') {
	AWS.config.setPromisesDependency(require('bluebird'));
	console.log("had to use bluebird");
}
else {
	console.log("global promise was found, so we are using sdk2+");
}

//create an IAM Group based off HR File record
const createGroup = (groupName) => {
	let params = {
		GroupName: groupName, /* required */
		Path: '/'
	};
	return iam.createGroup(params).promise();
};

//create an IAM User based off HR File record
const createUser = (userName) => {
	let params = {
		UserName: userName, /* required */
		Path: '/'
	};
	return iam.createUser(params).promise();
};

const addUserToGroup = (groupName, userName) => {
	let params = {
		GroupName: groupName, 
		UserName: userName
	};
	return iam.addUserToGroup(params).promise();
}

//use the node.js filesystem library to read a file and parse out as json
var empsJSON = JSON.parse(fs.readFileSync('employees.json'));

empsJSON.employees.map(data => {
	createGroup(data.orgunit).then(createUser(data.username)
		, (oops) => { console.log('something bad happened ' + oops)});
});
