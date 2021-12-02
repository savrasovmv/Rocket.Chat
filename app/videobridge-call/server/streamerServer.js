import { Meteor } from 'meteor/meteor'
import {
	Rooms,
	Subscriptions,
	Messages,
	Uploads,
	Integrations,
	Users,
} from '../../models'
import { streamerJitsiCall, streamName } from '../lib/streamer'
//import {createMeetURL} from './../lib/createMeet'
//import {generateMeetURL} from './methods/jitsiGenerateToken'

streamerJitsiCall.allowRead('logged')
streamerJitsiCall.allowWrite('logged')


export const sendStartCallJitsi = (userId = false, roomId = false) => {
	console.log("----------- sendStartCallJitsi-----------", userId, roomId)
	if (userId && roomId) {
		const subscriptions = Subscriptions.findByRoomId(roomId, {
			fields: { 'u._id': 1 },
			sort: { 'u.username': 1 },
		})

		const members = subscriptions.fetch().map((s) => s.u && s.u._id)
		//console.log('+++++++++++++++++++ members', members)
		const count = members.length
		//console.log('+++++++++++++++++++ count', count)
		if (members) {
			valueToCaller = {
				type: "outCall",
				roomId: roomId,
				initUserId: userId,
				count: count,
				members: [],
				//date: new Date()
			}

			//Добавляем участников, исключая инициатора
			members.map((id) => {
				if (id !== userId) {
					valueToCaller.members.push(
						{
							userId: id,
							status: false,
						}
					)
				}
			})
			valueToUser = {
				type: "inCall",
				roomId: roomId,
				initUserId: userId,
				count: count
			}
			members.map((id) => {
				if (id == userId) {
					streamerJitsiCall.emit(id + '/' + streamName, valueToCaller) //Данные для инициатора вызова
				} else {
					streamerJitsiCall.emit(id + '/' + streamName, valueToUser) //Запрос о готовности клиента
				}
			})
		}

	}


}


streamerJitsiCall.on(streamName, function (value) {
	//Обязательные параметры type, roomId, userId

	let valueToCaller = {}
	let valueToUser = {}


	if (value.type && value.userId && value.roomId) {
		switch (value.type) {
			// case 'start':
			// 	//Отправляем инициатору данные о участиках конференции
			// 	//Опрашиваем юзера о готовности принять вызов. отправляем ему ask

			// 	const subscriptions = Subscriptions.findByRoomId(value.roomId, {
			// 		fields: { 'u._id': 1 },
			// 		sort: { 'u.username': 1 },
			// 	})

			// 	const members = subscriptions.fetch().map((s) => s.u && s.u._id)
			// 	//console.log('+++++++++++++++++++ members', members)
			// 	const count = members.length
			// 	//console.log('+++++++++++++++++++ count', count)
			// 	if (members) {
			// 		valueToCaller = {
			// 			type: "outCall",
			// 			roomId: value.roomId,
			// 			initUserId: value.userId,
			// 			count: count,
			// 			members: [],
			// 			date: new Date()
			// 		}

			// 		//Добавляем участников, исключая инициатора
			// 		members.map((id) => {
			// 			if (id !== value.userId) {
			// 				valueToCaller.members.push(
			// 					{
			// 						userId: id,
			// 						status: false,
			// 					}
			// 				)
			// 			}
			// 		})
			// 		valueToUser = {
			// 			type: "inCall",
			// 			roomId: value.roomId,
			// 			initUserId: value.userId,
			// 			count: count
			// 		}
			// 		members.map((id) => {
			// 			console.log('STREEM to USER_ID', id)
			// 			if (id == value.userId) {
			// 				streamerJitsiCall.emit(id + '/'+ streamName, valueToCaller) //Данные для инициатора вызова
			// 			} else {
			// 				streamerJitsiCall.emit(id + '/'+ streamName, valueToUser) //Запрос о готовности клиента
			// 			}
			// 		})
			// 	}
			// break

			case 'cancel':
				//Если инициатор отменил вызов
				// Параметры type, roomId, userId, members
				if (value.members) {
					valueToUsers = {
						type: 'cancel',
						roomId: value.roomId,
						initUserId: value.userId,
					}
					value.members.map((m) => {
						streamerJitsiCall.emit(m.userId + '/' + streamName, valueToUsers) //Отмена вызова
					})
				}

				break

			case 'reject':
				// Если юзер отклонил входящий вызов
				// Параметры type, roomId, userId, initUserId
				if (value.initUserId) {
					valueToUsers = {
						type: 'reject',
						roomId: value.roomId,
						initUserId: value.initUserId,
						rejectUserId: value.userId, //юзер который отказлся принять вызов
					}
					//console.log('STREEM to USER_ID')
					streamerJitsiCall.emit(value.initUserId + '/' + streamName, valueToUsers) //Отказ от принятия входящего вызова
				}
				break

			case 'answer':
				// Если юзер принял входящий вызов, необходимо прекратить звонок на других устройствах
				// Параметры type, roomId, userId, initUserId
				if (value.initUserId) {
					// valueToUsers = {
					// 	type: 'answer',
					// 	roomId: value.roomId,
					// 	initUserId: value.initUserId,
					// 	answerUserId: value.userId, //юзер который принял входящий вызов
					// }
					//console.log('STREEM to USER_ID')
					// streamerJitsiCall.emit(value.initUserId + '/'+ streamName, valueToUsers) //Начать конференцию Вызывающему юзеру
					// streamerJitsiCall.emit(value.userId + '/'+ streamName, valueToUsers) //Начать конференцию ответившему юзеру
					//Говорим что ответили на другом устройстве
					streamerJitsiCall.emit(value.userId + '/' + streamName, { type: 'finishInCall', roomId: value.roomId, status: 'finishInCall' }) //Закончить вызов если ответивший имеет несколько запущенных клиентов
				}

				break

			case 'connect':
				// Опоздавший юзер
				if (value.userId) {
					streamerJitsiCall.emit(value.userId + '/' + streamName, { type: 'connect', roomId: value.roomId })
				}

				break

		}
	}
})




// streamerJitsiCall.on('sendJitsiCallToServer', function (value) {
// 	console.log("------------------- sendJitsiCallToServer-----------------")
// 	console.log("------value", value)
// 	console.log("--------------------------------------------------")
// 	if (value.jitsiUrl && value.userId && value.roomId) {
// 		console.log('++++++++++++++++++++++++++++++++++++++++++')
// 		const subscriptions = Subscriptions.findByRoomId(value.roomId, {
// 			fields: { 'u._id': 1 },
// 			sort: { 'u.username': 1 },
// 			//skip: offset,
// 			//limit: count,
// 		})

// 		//const total = subscriptions.count();
// 		console.log('++++++++++++++++++++++++++++++++++++++++++')
// 		const members = subscriptions.fetch().map((s) => s.u && s.u._id)
// 		console.log('++++++++++++++++++++++++++++++++++++++++++members', members)
// 		// const users = Users.find(
// 		// 	{ _id: { $in: members } },
// 		// 	{
// 		// 		fields: {
// 		// 			_id: 1,
// 		// 			username: 1,
// 		// 			name: 1,
// 		// 			status: 1,
// 		// 			statusText: 1,
// 		// 			utcOffset: 1,
// 		// 		},
// 		// 		sort: { username: sort.username != null ? sort.username : 1 },
// 		// 	}
// 		// ).fetch()
// 		// console.log('++++++++++++++++++++++++++++++++++++++++++members', users)
// 		members.map((id) => {
// 			if (id!==value.userId) {
// 				console.log('STREEM to USER_ID', id)

// 				//let steamName = id + '/getJitsiCall'
// 				streamerJitsiCall.emit(id + '/JitsiCall', value)

// 			}


// 		})

// 	}
// })


// streamerJitsiCall.on('sendClickJitsiCall', function (value) {
// 	console.log("------------------- sendClickJitsiCall-----------------")
// 	console.log("------value", value)
// 	console.log("--------------------------------------------------")
// 	if (value.userId && value.roomId) {
// 		console.log('++++++++++++++++++++++++++++++++++++++++++')
// 		const subscriptions = Subscriptions.findByRoomId(value.roomId, {
// 			fields: { 'u._id': 1 },
// 			sort: { 'u.username': 1 },
// 		})

// 		const members = subscriptions.fetch().map((s) => s.u && s.u._id)
// 		console.log('++++++++++++++++++++++++++++++++++++++++++members', members)
// 		members.map((id) => {
// 			console.log('STREEM to USER_ID', id)
// 			value.caller = id==value.userId ? true : false //true - Звонящий. false - Вызываемый
// 			streamerJitsiCall.emit(id + '/JitsiCall', value)


// 		})

// 	}
// })


// streamerJitsiCall.on('sendAnswerJitsiCall', function (value) {
// 	console.log("------------------- sendAnswerJitsiCall-----------------")
// 	console.log("------value", value)
// 	console.log("--------------------------------------------------")
// 	if (value.userId && value.roomId) {
// 		console.log('++++++++++++++++++++++++++++++++++++++++++')
// 		const subscriptions = Subscriptions.findByRoomId(value.roomId, {
// 			fields: { 'u._id': 1 },
// 			sort: { 'u.username': 1 },
// 		})

// 		const members = subscriptions.fetch().map((s) => s.u && s.u._id)
// 		console.log('++++++++++++++++++++++++++++++++++++++++++members', members)



// 		members.map((id) => {
// 			console.log('STREEM to USER_ID', id)
// 			value.caller = id==value.userId ? true : false //true - Звонящий. false - Вызываемый
// 			streamerJitsiCall.emit(id + '/AnswerJitsiCall', value)
// 		})
// 	}
// })

// streamerJitsiCall.on('sendRejectJitsiCall', function (value) {
// 	console.log("------------------- sendRejectJitsiCall-----------------")
// 	console.log("------value", value)
// 	console.log("--------------------------------------------------")
// 	if (value.userId && value.roomId) {
// 		console.log('++++++++++++++++++++++++++++++++++++++++++')
// 		const subscriptions = Subscriptions.findByRoomId(value.roomId, {
// 			fields: { 'u._id': 1 },
// 			sort: { 'u.username': 1 },
// 		})

// 		const members = subscriptions.fetch().map((s) => s.u && s.u._id)
// 		console.log('++++++++++++++++++++++++++++++++++++++++++members', members)



// 		members.map((id) => {
// 			console.log('STREEM to USER_ID', id)
// 			value.caller = id==value.userId ? true : false //true - Звонящий. false - Вызываемый
// 			streamerJitsiCall.emit(id + '/RejectJitsiCall', value)
// 		})
// 	}
// })


// value = {
// 	type : ["start", "ask", "accepted", "init", "cancel", "answer","reject", "connect", "stop", "error"],
//	initUserId: initUserId,
//	userId: userId,
//	roomId: roomId,
//	count: count
// 	members: [
// 			{
//	 			userId: userId,
// 				answered: true,
// 				accepted: true
// 			}
// 		],
// }
