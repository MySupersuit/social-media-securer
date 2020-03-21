/**
* Globals
 */
groups = [];
users = ['Tom','Jack','John','Yanika'];

/**
 * Required External Modules
 */

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

/**
 * App Variables
 */

const app = express();
const port = process.env.PORT || "8000";

/**
 *  App Configuration
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json())

/**
 * Routes Definitions
 */

app.get("/", (req, res) => {
	res.render("index", {title:"Home"});
});

app.get("/groups", (req, res) => {
	res.render("groups");
});

app.get("/wall", (req, res) => {
	res.render("wall");
});

app.get("/compose", (req, res) => {
	res.render("compose");
});

app.get("/newgroup", (req, res) => {
	res.render("newgroup");
});

app.post("/newgroup", (req, res) => {
	var name = req.body.group_name;
	addGroup(name);
	
	res.render("newgroup");
});

app.post("/viewgroups", (req, res) => {
	var removeGroupButton = req.body.remove;
	var addMemberButtonText = req.body.addMember;
	var removeMemberButtonText = req.body.removeMember;
	console.log(removeGroupButton);
	console.log(addMemberButtonText);
	console.log(removeMemberButtonText);

	if (removeGroupButton) {
		removeGroup(removeGroupButton);
	} else if (addMemberButtonText) {
		memberName = req.body.memberdropdown;
		addMemberToGroup(memberName, addMemberButtonText);
	} else if (removeMemberButtonText) {
		memberName = req.body.memberdropdown;
		removeMemberFromGroup(memberName, removeMemberButtonText);
	}
	res.render("viewgroups");
});

app.get("/viewgroups", (req, res) => {
	console.log("passing");
	console.log(groups);
	res.render("viewgroups", {groups:groups, users:users});
});


/**
 * Server Activation
 */

app.listen(port, () => {
	console.log(`Listening to requests on http://localhost:${port}`);
});

/*
--------------------------
*/

function addMemberToGroup(member, buttonText) {
	groupName = buttonText.substr(14, buttonText.length+1);
	console.log("adding " + member + " to " + groupName);
	gIndex = getGroupIndex(groupName);
	group = groups[gIndex];
	members = group.members;
	if (!members.includes(member)) {
		members.push(member);
		console.log("pushed")
	}
	console.log(groups);
}

function removeMemberFromGroup(member, buttonText) {
	groupName = buttonText.substr(19, buttonText.length+1);
	console.log("removing " + member + " from " + groupName);
	gIndex = getGroupIndex(groupName);
	group = groups[gIndex];
	members = group.members;
	
	if (members.includes(member)) {
		for (i = 0; i < members.length; i++) {
			if (members[i] == member) {
				members.splice(i, 1);
				break;
			}
		}
	}


	console.log(groups);
}

function addGroup(groupName) {
	var newGroup = {
		name: groupName,
		members: []
	};
	let addGroup = true;
	for (i = 0; i < groups.length; i++) {
		if (groups[0].name == groupName) {
			addGroup = false;
			break;
		}
	}
	if (addGroup) {
		groups.push(newGroup);
	}
}

function removeGroup(buttonName) {

	// 7 IS LENGTH OF 'REMOVE'
	var name = buttonName.substr(7,buttonName.length+1);

	index = getGroupIndex(name);
	if (index > -1) {
		groups.splice(index,1);
	}
}

function getGroupIndex(groupName) {
	for (i = 0; i < groups.length; i++) {
		if (groups[i].name == groupName) {
			return i;
		}
	}
	return -1;
}