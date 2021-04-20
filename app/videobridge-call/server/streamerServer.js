import { Meteor } from 'meteor/meteor'
import {
	Rooms,
	Subscriptions,
	Messages,
	Uploads,
	Integrations,
	Users,
} from '../../models'
import {streamerJitsiCall} from '../lib/streamer'

streamerJitsiCall.allowRead('logged')
streamerJitsiCall.allowWrite('logged')

streamerJitsiCall.on('sendJitsiCallToServer', function (value) {
	console.log("------------------- sendJitsiCallToServer-----------------")
	console.log("------value", value)
	console.log("--------------------------------------------------")
	if (value.jitsiUrl && value.userId && value.roomId) {
		console.log('++++++++++++++++++++++++++++++++++++++++++')
		const subscriptions = Subscriptions.findByRoomId(value.roomId, {
			fields: { 'u._id': 1 },
			sort: { 'u.username': 1 },
			//skip: offset,
			//limit: count,
		})

		//const total = subscriptions.count();
		console.log('++++++++++++++++++++++++++++++++++++++++++')
		const members = subscriptions.fetch().map((s) => s.u && s.u._id)
		console.log('++++++++++++++++++++++++++++++++++++++++++members', members)
		// const users = Users.find(
		// 	{ _id: { $in: members } },
		// 	{
		// 		fields: {
		// 			_id: 1,
		// 			username: 1,
		// 			name: 1,
		// 			status: 1,
		// 			statusText: 1,
		// 			utcOffset: 1,
		// 		},
		// 		sort: { username: sort.username != null ? sort.username : 1 },
		// 	}
		// ).fetch()
		// console.log('++++++++++++++++++++++++++++++++++++++++++members', users)
		members.map((id) => {
			if (id!==value.userId) {
				console.log('STREEM to USER_ID', id)

				//let steamName = id + '/getJitsiCall'
				streamerJitsiCall.emit(id + '/JitsiCall', value)

			}


		})

	}
})
