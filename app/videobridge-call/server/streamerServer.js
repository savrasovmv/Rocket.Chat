import { Meteor } from 'meteor/meteor'
import {
	Rooms,
	Subscriptions,
	Messages,
	Uploads,
	Integrations,
	Users,
} from '../../models'
import {streamerJitsiCall, streamName } from '../lib/streamer'
//import {createMeetURL} from './../lib/createMeet'
import {generateMeetURL} from './methods/jitsiGenerateToken'

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


streamerJitsiCall.on('sendClickJitsiCall', function (value) {
	console.log("------------------- sendClickJitsiCall-----------------")
	console.log("------value", value)
	console.log("--------------------------------------------------")
	if (value.userId && value.roomId) {
		console.log('++++++++++++++++++++++++++++++++++++++++++')
		const subscriptions = Subscriptions.findByRoomId(value.roomId, {
			fields: { 'u._id': 1 },
			sort: { 'u.username': 1 },
		})

		const members = subscriptions.fetch().map((s) => s.u && s.u._id)
		console.log('++++++++++++++++++++++++++++++++++++++++++members', members)
		members.map((id) => {
			console.log('STREEM to USER_ID', id)
			value.caller = id==value.userId ? true : false //true - Звонящий. false - Вызываемый
			streamerJitsiCall.emit(id + '/JitsiCall', value)


		})

	}
})


streamerJitsiCall.on('sendAnswerJitsiCall', function (value) {
	console.log("------------------- sendAnswerJitsiCall-----------------")
	console.log("------value", value)
	console.log("--------------------------------------------------")
	if (value.userId && value.roomId) {
		console.log('++++++++++++++++++++++++++++++++++++++++++')
		const subscriptions = Subscriptions.findByRoomId(value.roomId, {
			fields: { 'u._id': 1 },
			sort: { 'u.username': 1 },
		})

		const members = subscriptions.fetch().map((s) => s.u && s.u._id)
		console.log('++++++++++++++++++++++++++++++++++++++++++members', members)



		members.map((id) => {
			console.log('STREEM to USER_ID', id)
			value.caller = id==value.userId ? true : false //true - Звонящий. false - Вызываемый
			streamerJitsiCall.emit(id + '/AnswerJitsiCall', value)
		})
	}
})

streamerJitsiCall.on('sendRejectJitsiCall', function (value) {
	console.log("------------------- sendRejectJitsiCall-----------------")
	console.log("------value", value)
	console.log("--------------------------------------------------")
	if (value.userId && value.roomId) {
		console.log('++++++++++++++++++++++++++++++++++++++++++')
		const subscriptions = Subscriptions.findByRoomId(value.roomId, {
			fields: { 'u._id': 1 },
			sort: { 'u.username': 1 },
		})

		const members = subscriptions.fetch().map((s) => s.u && s.u._id)
		console.log('++++++++++++++++++++++++++++++++++++++++++members', members)



		members.map((id) => {
			console.log('STREEM to USER_ID', id)
			value.caller = id==value.userId ? true : false //true - Звонящий. false - Вызываемый
			streamerJitsiCall.emit(id + '/RejectJitsiCall', value)
		})
	}
})


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


streamerJitsiCall.on(streamName, function (value) {
	//Обязательные параметры type, roomId, userId

	console.log("------------------- CallJitsi-----------------")
	console.log("------value", value)
	console.log("--------------------------------------------------")

	let valueToCaller = {}
	let valueToUser = {}


	if (value.type && value.userId && value.roomId) {
		switch(value.type) {
			case 'start':
				//Отправляем инициатору данные о участиках конференции
				//Опрашиваем юзера о готовности принять вызов. отправляем ему ask

				const subscriptions = Subscriptions.findByRoomId(value.roomId, {
					fields: { 'u._id': 1 },
					sort: { 'u.username': 1 },
				})

				const members = subscriptions.fetch().map((s) => s.u && s.u._id)
				console.log('+++++++++++++++++++ members', members)
				const count = members.length
				console.log('+++++++++++++++++++ count', count)
				if (members) {
					valueToCaller = {
						type: "start",
						roomId: value.roomId,
						initUserId: value.userId,
						count: count,
						members: [],
						date: new Date()
					}

					//Добавляем участников, исключая инициатора
					members.map((id) => {
						if (id !== value.userId) {
							valueToCaller.members.push(
								{
									userId: id,
									status: false,
								}
							)
						}
					})
					valueToUser = {
						type: "ask",
						roomId: value.roomId,
						initUserId: value.userId,
						count: count
					}
					members.map((id) => {
						console.log('STREEM to USER_ID', id)
						if (id == value.userId) {
							streamerJitsiCall.emit(id + '/'+ streamName, valueToCaller) //Данные для иницивтора вызова
						} else {
							streamerJitsiCall.emit(id + '/'+ streamName, valueToUser) //Запрос о готовности клиента
						}
					})



				}

				break

			case 'accepted':
				//Юзер ответил что принял ask и готов принять вызов
				//входняе параметры type, roomId, initUserId, userId
				if (value.initUserId) {

					valueToUsers = {
						type: 'init',
						roomId: value.roomId,
						initUserId: value.initUserId,
						count: value.count
					}

					streamerJitsiCall.emit(value.initUserId + '/'+ streamName, valueToUsers) //Отправка инициатору
					streamerJitsiCall.emit(value.userId + '/'+ streamName, valueToUsers) //Отправка ответивщему accepted
				}

				break

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
						console.log('STREEM to USER_ID', m)
						streamerJitsiCall.emit(m.userId + '/'+ streamName, valueToUsers) //Отмена вызова
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
					console.log('STREEM to USER_ID')
					streamerJitsiCall.emit(value.initUserId + '/'+ streamName, valueToUsers) //Отказ от принятия входящего вызова
				}

				break

			case 'answer':
				// Если юзер принял входящий вызов
				// Параметры type, roomId, userId, initUserId
				if (value.initUserId) {
					valueToUsers = {
						type: 'connect',
						roomId: value.roomId,
						initUserId: value.initUserId,
						answerUserId: value.userId, //юзер который принял входящий вызов
					}
					console.log('STREEM to USER_ID')
					streamerJitsiCall.emit(value.initUserId + '/'+ streamName, valueToUsers) //Начать конференцию Вызывающему юзеру
					streamerJitsiCall.emit(value.userId + '/'+ streamName, valueToUsers) //Начать конференцию ответившему юзеру
					//Говорим что ответили на другом устройстве
					streamerJitsiCall.emit(value.userId + '/'+ streamName, {type: 'answer', roomId: value.roomId}) //Закончить вызов если ответивший имеет несколько запущенных клиентов
				}

				break
			case 'afterAnswer':
				// Если юзер принял входящий вызов, когда уже идет конференция
				// Параметры type, roomId, userId, initUserId, lateUserId
				if (value.initUserId && value.lateUserId) {
					valueToUsers = {
						type: 'afterConnect',
						roomId: value.roomId,
						initUserId: value.initUserId,
						answerUserId: value.initUserId, //юзер который принял входящий вызов
					}
					console.log('STREEM to USER_ID')
					//Отправляем только опоздавшему юзеру
					streamerJitsiCall.emit(value.lateUserId + '/'+ streamName, valueToUsers) //Начать конференцию опоздавщему юзеру
				}

				break

			case 'endMeet':
				// Авто закрытие окна конференции
				if (value.userIdToSendEnd) {
					valueToUsers = {
						type: 'closeWindowsMeet',
						roomId: value.roomId,
					}
					console.log('STREEM to USER_ID closeWindowsMeet')
					//Отправляем только опоздавшему юзеру
					streamerJitsiCall.emit(value.userIdToSendEnd + '/'+ streamName, valueToUsers) //Закрыть окно конференции
				}

				break

			case 'busy':
				// Если юзер занят, когда идет другая конференция
				// Параметры type, roomId, userId, initUserId
				if (value.initUserId) {
					valueToUsers = {
						type: 'busy',
						roomId: value.roomId,
						initUserId: value.initUserId,
						busyUserId: value.userId, //юзер который занят
					}
					console.log('STREEM to USER_ID')
					streamerJitsiCall.emit(value.initUserId + '/'+ streamName, valueToUsers) //Ответ занят Вызывающему юзеру
				}

				break


		}
	}
})
