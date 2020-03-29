/**
* Globals
 */

groups = [{
	name: "Radiohead",
	members: [
		"Thom", "Jonny","Colin","Phil", "Ed", "YOU"
	],
	passcode: "slkd9jf3sd"
}];
users = ['Thom','Jonny','Colin','Phil','Ed', 'Yanika', 'YOU'];
posts = [];

/**
 * Required External Modules
 */

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const crypt = require('crypto-js');

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
	res.render("groups", {title:"Groups"});
});

app.get("/wall", (req, res) => {
	res.render("wall", {title:"Wall", groups:groups, user:users, posts:posts});
});

app.get("/newgroup", (req, res) => {
	res.render("newgroup", {title:"New Group", msg:""});
});

app.post("/newgroup", (req, res) => {
	var name = req.body.group_name;
	e = addGroup(name);
	msg = "";
	if (e == -1) {
		msg = "Error: group already exists"
	} else {
		msg = "Group '"+name+"' created.";
	}
	
	res.render("newgroup", {title:"New Group", msg:msg});
});

app.post("/viewgroups", (req, res) => {
	var removeGroupButton = req.body.remove;
	var addMemberButtonText = req.body.addMember;
	var removeMemberButtonText = req.body.removeMember;

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
	res.render("viewgroups", {title:"View Groups", groups:groups, users:users});
});

app.post("/wall", (req, res) => {
	delete_content = req.body.delete;
	if (delete_content) {
		deleteMessage(delete_content);
	}

	decrypt_content = req.body.decrypt;
	if (decrypt_content) {
		decryptMessage(decrypt_content);
	}
	encrypt_content = req.body.encrypt;
	if (encrypt_content) {
		encryptMessage(encrypt_content)
	}
	post_content = req.body.wall_post;
	toGroup = req.body.groupdropdown;
	author = req.body.memberdropdown;
	
	if (toGroup) {
		createPost(post_content,toGroup,author);
	}

	res.render("wall", {title:"Wall"});
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
	}
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
}

function getTimeString() {
	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+
		'-'+today.getDate();
	var time = today.getHours()+":"+today.getMinutes()+":"+
			today.getSeconds();
			
	return date+" at "+time;
}

function createPost(content, toGroup, author) {
	if (inGroup(author, toGroup)) {
		group = groups[getGroupIndex(toGroup)];
		encrypt_content = crypt.AES.encrypt(content, group.passcode);
		time = getTimeString();
		var newPost = {
			content: {
				message: encrypt_content,
				encrypted: true,
			},
			time: time,
			group: toGroup,
			author: author
		};

		posts.unshift(newPost);
		console.log("posted");
	} else {
		console.log("not posted");
	}
}



function createPasscode() {
	s = Math.random().toString(36).substring(2, 15) + 
	Math.random().toString(36).substring(2, 15);
	return s;
}

function isUniqueGroupName(name) {
	name = name.trim();
	for (let i = 0; i < groups.length; i++) {
		if (groups[i].name.toLowerCase() == name.toLowerCase()) {
			return false;
		}
	}
	return true;
}

function addGroup(groupName) {
	if(!isUniqueGroupName(groupName)) {
		return -1;
	}

	newPasscode = createPasscode();
	var newGroup = {
		name: groupName,
		members: [],
		passcode: newPasscode
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
	return 0;
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
	for (let i = 0; i < groups.length; i++) {
		if (groups[i].name == groupName) {
			return i;
		}
	}
	return -1;
}

function inGroup(author, groupName) {
	group = groups[getGroupIndex(groupName)];
	if (group.members.includes(author)) {
		return true;
	} 
	return false;
}

function deleteMessage(content) {
	var splits = content.split('|-|');
	msg = splits[0];
	time = splits[1];

	for (let i = 0; i < posts.length; i++) {
		if (posts[i].content.message == msg &&
			posts[i].time == time) {
			groupName = posts[i].group;
			group = groups[getGroupIndex(groupName)];
			if (group.members.includes("YOU")) {
				posts.splice(i, 1);
			}
		}
	}
}

function decryptMessage(content) {
	var splits = content.split('|-|');
	msg = splits[0];
	time = splits[1];

	console.log("decrypting");
	var group;
	for (let i = 0; i < posts.length; i++) {
		if (posts[i].content.message == msg &&
			posts[i].time == time &&
			posts[i].content.encrypted == true) {
			groupName = posts[i].group;
			group = groups[getGroupIndex(groupName)];
			if (group.members.includes("YOU")) {
				var decrypt = crypt.AES.decrypt(content, group.passcode);
				posts[i].content.message = decrypt.toString(crypt.enc.Utf8);
				posts[i].content.encrypted = false;
			}
		}
	}
}

function encryptMessage(content) {
	var splits = content.split('|-|');
	msg = splits[0];
	time = splits[1];

	console.log("encrypting");
	var group;
	for (let i = 0; i < posts.length; i++) {
		if (posts[i].content.message == msg
			&& posts[i].time == time
			&& posts[i].content.encrypted == false) {
			groupName = posts[i].group;
			group = groups[getGroupIndex(groupName)];
			if (group.members.includes("YOU")) {
				var encrypt = crypt.AES.encrypt(msg, group.passcode);
				posts[i].content.message = encrypt.toString();
				posts[i].content.encrypted = true;
			}
		}
	}
}