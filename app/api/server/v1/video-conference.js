import { Meteor } from 'meteor/meteor';

import { Rooms, Subscriptions } from '../../../models/server';
import { API } from '../api';
import { sendStartCallJitsi, getUserInfoFSMeet } from '../../../videobridge-call/server/streamerServer';
import { reject } from 'underscore';
import { setTimeout } from 'timers';

import { streamerJitsiCall, streamName, sendBusy, getStreemerMeet } from '../../../videobridge-call/lib/streamer'

import { Users } from '../../../models/server';


import { Notifications } from '../../../notifications/server';


API.v1.addRoute('users.getUserInfoFSMeet', { authRequired: true }, {
	post() {

		console.log("+++++++this.userId", this.userId)
		const user = Users.findOneById(this.userId);
		if (!user) {
			return API.v1.failure('user does not exist!');
		}

		// let d = await getUserInfoFSMeet(user.username)
		// const d = Meteor.wrapAsync(getUserInfoFSMeet)(user.username);

		let result
		result = Meteor.call('fsmeet:getUserInfo', {
			
		});
		if (result) {
			return API.v1.success({
				_id: user._id,
				fs_password: result.result.fs_password
			});

		} else {
			return API.v1.failure('Error!');
		}
	
	},
});


API.v1.addRoute('video-conference/jitsi.update-timeout', { authRequired: true }, {
	post() {
		const { roomId } = this.bodyParams;
		if (!roomId) {
			return API.v1.failure('The "roomId" parameter is required!');
		}

		const room = Rooms.findOneById(roomId, { fields: { _id: 1 } });
		if (!room) {
			return API.v1.failure('Room does not exist!');
		}

		const jitsiTimeout = Meteor.runAsUser(this.userId, () => Meteor.call('jitsi:updateTimeout', roomId));

		return API.v1.success({ jitsiTimeout });
	},
});



API.v1.addRoute(
	'video-conference.start',
	{ authRequired: true,  rateLimiterOptions: { numRequestsAllowed: 3, intervalTimeInMS: 60000 } },
	{
		post() {
			const { roomId, callId, initUserId, action} = this.bodyParams;
			const { userId } = this;


			console.log("+++++++video-conference.start roomId", roomId)
			console.log("+++++++video-conference.start callId", callId)
			// if (!userId || !(await canAccessRoomIdAsync(roomId, userId))) {
			// 	return API.v1.failure('invalid-params');
			// }

			// if (!(await hasPermissionAsync(userId, 'call-management', roomId))) {
			// 	return API.v1.forbidden();
			// }

			try {
				
				let d = sendStartCallJitsi(userId, roomId, userId, callId)

				return API.v1.success({
					data: d
					//providerName: "providerName"
				});
				// return API.v1.success({
				// 	data: {
				// 		// rid: roomId,
				// 		type: 'direct',
				// 		calleeId: userId,
				// 		callId: await sendStartCallJitsi(userId, roomId),
				// 		// ...(await {conf_name: 'fgdfgdfg'}),
						
				// 	},
				// 	//providerName: "providerName"
				// });
			} catch (e) {
				return API.v1.failure('Room does not exist!');
				// return API.v1.failure(await VideoConf.diagnoseProvider(userId, roomId));
			}
		},
	},
);



API.v1.addRoute(
	'video-conference.cancel',
	{ authRequired: true, rateLimiterOptions: { numRequestsAllowed: 3, intervalTimeInMS: 60000 } },
	{
		async post() {
			const { callId, roomId } = this.bodyParams;
			const { userId } = this;

			
			const subscriptions = Subscriptions.findByRoomId(roomId, {
				fields: { 'u._id': 1 },
				sort: { 'u.username': 1 },
			})

			const members = subscriptions.fetch().map((s) => s.u && s.u._id)

			valueToUsers = {
				type: 'cancel',
				roomId: roomId,
				userId: userId,
				initUserId: userId,
				members: [],
				callId: callId
			}
			//Добавляем участников, исключая инициатора
			members.map((id) => {
				if (id !== userId) {
					streamerJitsiCall.emit(id + '/' + streamName, valueToUsers) //Отмена вызова
				}
			})

			return API.v1.success();
		},
	},
);




API.v1.addRoute(
	'video-conference.accepted',
	{ authRequired: true, rateLimiterOptions: { numRequestsAllowed: 3, intervalTimeInMS: 60000 } },
	{
		async post() {
			const { callId, initUserId } = this.bodyParams;
			const { userId } = this;
			const roomId = callId
			
			const subscriptions = Subscriptions.findByRoomId(roomId, {
				fields: { 'u._id': 1 },
				sort: { 'u.username': 1 },
			})

			const members = subscriptions.fetch().map((s) => s.u && s.u._id)

			valueToUsers = {
				type: 'answer',
				roomId: roomId,
				userId: userId,
				initUserId: initUserId,
				members: []
			}

			console.log("++++++++++video-conference.accepted valueToUsers", valueToUsers)
			
			//Сообщаем инициатору что мы ответили
			streamerJitsiCall.emit(initUserId + '/' + streamName, valueToUsers) //ответили на вызов
			Notifications.notifyUser(id, 'video-conference', { callId: roomId, action: 'inCall', meetParam: {rcSession: rcSession, initUserId: userId} });
			
				
			

			return API.v1.success();
		},
	},
);








API.v1.addRoute(
	'video-conference.join',
	{ authRequired: true, rateLimiterOptions: { numRequestsAllowed: 3, intervalTimeInMS: 60000 } },
	{
		post() {
			const { callId } = this.bodyParams;
			const { userId } = this;

			return API.v1.success({
				url: `https://savrasov.tmenergo.ru:/conference/${callId}`,
				providerName: 'jitsi'
			});
		},
	},
);



API.v1.addRoute(
	'video-conference.info',
	{ authRequired: true, rateLimiterOptions: { numRequestsAllowed: 3, intervalTimeInMS: 60000 } },
	{
		post() {
			const { callId } = this.bodyParams;
			const { userId } = this;

			return API.v1.success({
				url: `https://savrasov.tmenergo.ru:/conference/${callId}`,
				providerName: 'jitsi'
			});
		},
	},
);
