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

import fetch from 'node-fetch';
import type { RequestInit, Response } from 'node-fetch';
import { settings } from '../../settings';
//import {createMeetURL} from './../lib/createMeet'
//import {generateMeetURL} from './methods/jitsiGenerateToken'

streamerJitsiCall.allowRead('logged')
streamerJitsiCall.allowWrite('logged')


async function createSessionFSMeet(roomId, rcSession) {
    try {

		const uid = Meteor.userId();

		const user = Users.findOneById(uid, {
			fields: {
				username: 1,
				type: 1,
			},
		});

		const room = Rooms.findOneById(roomId);
		const domain = settings.get('Jitsi_Domain');
		const fs_token = settings.get('JitsiCall_FSMeet_Token');
		
		const url = `https://${domain}/conference/rc/create`
		const data = {
			username: user.username,
			confName: room.t === 'd' ? room.usernames.join(' x ') : room.fname,
			rcSession: rcSession,
			token: fs_token
		}
		const response = await fetch(url, {
			method: 'POST', // *GET, POST, PUT, DELETE, etc.
			mode: 'cors', // no-cors, *cors, same-origin
			cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
			credentials: 'same-origin', // include, *same-origin, omit
			headers: new Headers({
				//   Authorization: 'Bearer my-secret-key',
				'Content-Type': 'application/json'
			}),
			redirect: 'follow', // manual, *follow, error
			referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
			body: JSON.stringify(data) // body data type must match "Content-Type" header
		});
		const resdata = await response.json();
		return resdata;
    } catch (err) {
		return {
			result: {
					success: false,
					'text': err
				}
		};
    }
}


export const sendStartCallJitsi = async (userId = false, roomId = false) => {
	// console.log("----------- sendStartCallJitsi-----------", userId, roomId)
	if (userId && roomId) {
		const subscriptions = Subscriptions.findByRoomId(roomId, {
			fields: { 'u._id': 1 },
			sort: { 'u.username': 1 },
		})

		// Случайная трока для сессии
		const rcSession = Math.random().toString(36).substring(2, 12 + 2)

		if (settings.get('JitsiCall_FSMeet_Enabled')) {

			const resfs = await createSessionFSMeet(roomId, rcSession);
			if (!resfs.result.success) {
				return false
			}
		}



		const members = subscriptions.fetch().map((s) => s.u && s.u._id)
		const count = members.length
		if (members) {
			valueToCaller = {
				type: "outCall",
				roomId: roomId,
				initUserId: userId,
				count: count,
				members: [],
				rcSession: rcSession,
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
				count: count,
				rcSession: rcSession,
			}
			members.map((id) => {
				if (id == userId) {
					streamerJitsiCall.emit(id + '/' + streamName, valueToCaller) //Данные для инициатора вызова
				} else {
					streamerJitsiCall.emit(id + '/' + streamName, valueToUser) //Запрос о готовности клиента
				}
			})
			return true
		}

		return false

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
					valueToUsers = {
						type: 'answer',
						roomId: value.roomId,
						initUserId: value.initUserId,
						answerUserId: value.userId, //юзер который принял входящий вызов
					}
					//console.log('STREEM to USER_ID')
					streamerJitsiCall.emit(value.initUserId + '/'+ streamName, valueToUsers) //Начать конференцию Вызывающему юзеру
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
