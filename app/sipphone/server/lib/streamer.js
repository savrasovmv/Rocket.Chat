import { Meteor } from 'meteor/meteor'

import { Push } from '../../../push/server/push'



export const streamerSipStatus = new Meteor.Streamer('sip')
streamerSipStatus.allowRead('logged')
streamerSipStatus.allowWrite('logged')
//streamerSipStatus.emit('setStatusSIP', status)

streamerSipStatus.on('setStatusSIP', function (value) {
	//console.log('sipStatus Server: ' + sipStatusServer)
	if (value.status && value.userId) {
		const steamName = value.userId + '/getStatusSIP'
		streamerSipStatus.emit(steamName, value.status)
	}
})

streamerSipStatus.on('setMissedSIP', function (value) {
	//console.log('sipStatus Server: ' + sipStatusServer)
	if (value.status && value.userId) {
		const steamName = value.userId + '/getMissedSIP'
		streamerSipStatus.emit(steamName, value.status)
		// const user = Meteor.users.findOne({ _id: value.userId })

		// const options = {
		// 	from: 'push',
		// 	title: 'Пропущен вызов',
		// 	text: 'Вы пропустили звонок',
		// 	userId: value.userId,
		// }
		// Push.send(options)
	}
})

