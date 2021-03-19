// import { Meteor } from 'meteor/meteor'
// export const streamer = new Meteor.Streamer('sip')
// console.log('Start STREAMER 2')

// if (Meteor.isClient) {
// 	console.log('Start STREAMER 3')
// 	sendSip = function (message) {
// 		streamer.emit('message', message)
// 		console.log('me: ' + message)
// 		return true
// 	}

// 	// streamer.on('message', function (message) {
// 	// 	console.log('user: ' + message)
// 	// })
// }
// // if (Meteor.isServer) {
// // 	console.log('Start STREAMER SERVER')
// // 	streamer.allowRead('all')
// // 	streamer.allowWrite('all')
// // }
