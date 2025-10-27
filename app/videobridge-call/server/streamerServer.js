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
// import type { RequestInit, Response } from 'node-fetch';
import { settings } from '../../settings';
//import {createMeetURL} from './../lib/createMeet'
//import {generateMeetURL} from './methods/jitsiGenerateToken'

import {Notifications} from '../../notifications/server';

import { PushVoIP } from '../../push/server/pushVoIP'
import { v4 as uuidv4 } from 'uuid';



streamerJitsiCall.allowRead('logged')
streamerJitsiCall.allowWrite('logged')





export async function getUserInfoFSMeet() {
    try {

		const uid = Meteor.userId();

		const user = Users.findOneById(uid, {
			fields: {
				username: 1,
				type: 1,
			},
		});

		const domain = settings.get('Jitsi_Domain');
		const fs_token = settings.get('JitsiCall_FSMeet_Token');
		
		const url = `https://${domain}/conference/rc/get_password`
		const data = {
			username: user.username,
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
		console.log("++++++getUserInfoFSMeet", resdata)
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


export const sendStartCallJitsi = async (userId = false, roomId = false, initUserId = false, callId = false) => {
	console.log("----------- sendStartCallJitsi----------- callId", callId)
	if (userId && roomId) {

		const uid = Meteor.userId();

		const user = Users.findOneById(uid, {
			fields: {
				username: 1,
				type: 1,
			},
		});

		fname = user.fname || user.username;

		const subscriptions = Subscriptions.findByRoomId(roomId, {
			fields: { 'u._id': 1 },
			sort: { 'u.username': 1 },
		})
		let resfs;
		// Случайная трока для сессии
		if (!callId) callId = uuidv4()
		const rcSession = callId //|| uuidv4()//Math.random().toString(36).substring(2, 12 + 2)

		if (settings.get('JitsiCall_FSMeet_Enabled')) {

			resfs = await createSessionFSMeet(roomId, rcSession);
			if (!resfs.result || !resfs.result.success) {
				Notifications.notifyUser(userId, 'video-conference', { callId: callId,  action: 'errorcall'});
				return false
			}
		}

		// uuid = uuidv4()

		const members = subscriptions.fetch().map((s) => s.u && s.u._id)
		const count = members.length
		if (members) {
			valueToCaller = {
				type: "outCall",
				action: "outCall",
				roomId: roomId,
				initUserId: userId,
				count: count,
				members: [],
				rcSession: rcSession,
				//Для мобильного клиента:
				callId: callId,
				meetParam: resfs.result
				// uid: userId,
				// rid: roomId,
				// uuid: uuid
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
				action: "inCall",
				roomId: roomId,
				initUserId: userId,
				count: count,
				rcSession: rcSession,
				callId: callId,
				callerName: fname, //ФИО звонящего
				handle: 'VoIP Call'

			}
			members.map((id) => {
				if (id == userId) {
					streamerJitsiCall.emit(id + '/' + streamName, valueToCaller) //Данные для инициатора вызова
					Notifications.notifyUser(id, 'video-conference', valueToCaller);  //Для мобильного клиента
				} else {
					streamerJitsiCall.emit(id + '/' + streamName, valueToUser) //Запрос о готовности клиента
					PushVoIP.send({initUserId: userId, userId: id, callId: callId, title: 'VoIP Call', action: 'inCall', payload: valueToUser })

				}
			})
			return resfs
		}

		return false

	}


}



streamerJitsiCall.on(streamName, function (value) {
	//Обязательные параметры type, roomId, userId

	let valueToCaller = {}
	let valueToUser = {}

	console.log("++++++streamerJitsiCall.on" , value)


	if (value.type && value.userId && value.roomId) {
		switch (value.type) {
		

			case 'cancel':
				//Если инициатор отменил вызов
				// Параметры type, roomId, userId, members
				if (value.members) {
					valueToUsers = {
						type: 'cancel',
						roomId: value.roomId,
						initUserId: value.userId,
						callId: value.callId,
					}
					value.members.map((m) => {
						streamerJitsiCall.emit(m.userId + '/' + streamName, valueToUsers) //Отмена вызова
						Notifications.notifyUser(m.userId, 'video-conference', valueToUsers);
					})
				}

				break

			case 'reject':
				// Если юзер отклонил входящий вызов
				// Параметры type, roomId, userId, initUserId
				if (value.initUserId) {
					valueToUsers = {
						type: 'reject',
						action: 'rejected',
						roomId: value.roomId,
						// rid: value.roomId,
						initUserId: value.initUserId,
						rejectUserId: value.userId, //юзер который отказлся принять вызов
						callId: value.callId,
					}
					//console.log('STREEM to USER_ID')
					streamerJitsiCall.emit(value.initUserId + '/' + streamName, valueToUsers) //Отказ от принятия входящего вызова
					Notifications.notifyUser(value.initUserId, 'video-conference', valueToUsers);
				}
				break

			case 'answer':
				// Если юзер принял входящий вызов, необходимо прекратить звонок на других устройствах
				// Параметры type, roomId, userId, initUserId
				if (value.initUserId) {
					valueToUsers = {
						type: 'answer',
						action: 'confirmed',
						roomId: value.roomId,
						initUserId: value.initUserId,
						answerUserId: value.userId, //юзер который принял входящий вызов
						// rid: value.roomId,
						callId: value.callId,
					}
					//console.log('STREEM to USER_ID')
					streamerJitsiCall.emit(value.initUserId + '/'+ streamName, valueToUsers) //Начать конференцию Вызывающему юзеру
					// streamerJitsiCall.emit(value.userId + '/'+ streamName, valueToUsers) //Начать конференцию ответившему юзеру

					Notifications.notifyUser(value.initUserId, 'video-conference', valueToUsers);



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


