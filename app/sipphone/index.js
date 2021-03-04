import { Meteor } from 'meteor/meteor';

if (Meteor.isClient) {
	module.exports = require('./client/index.jsx');
	module.exports = require('./db/index.jsx');
}
if (Meteor.isServer) {
	module.exports = require('./server/index.jsx');
	module.exports = require('./db/index.jsx');
}
