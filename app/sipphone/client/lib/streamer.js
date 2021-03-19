import { Meteor } from 'meteor/meteor'
export const streamerSipStatus = new Meteor.Streamer('sip')

export const setStatusSIP = (status) => {
	const steamName = 'setStatusSIP'
	const value = {
		status: status,
		userId: Meteor.userId(),
	}
	streamerSipStatus.emit(steamName, value)
}

export const getStatusSIP = (setFunc) => {
	const steamName = Meteor.userId() + '/getStatusSIP'
	streamerSipStatus.on(steamName, function (status) {
		//console.log('sipStatus Server: ' + sipStatusServer)
		setFunc(status)
	})
}

export const setMissedSIP = (status) => {
	const steamName = 'setMissedSIP'
	const value = {
		status: status,
		userId: Meteor.userId(),
	}
	streamerSipStatus.emit(steamName, value)
}

export const getMissedSIP = (setFunc) => {
	const steamName = Meteor.userId() + '/getMissedSIP'
	streamerSipStatus.on(steamName, function (status) {
		//console.log('sipStatus Server: ' + sipStatusServer)
		setFunc(status)
	})
}
