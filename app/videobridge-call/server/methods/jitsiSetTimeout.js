import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';

import { Rooms, Messages, Users } from '../../../models/server';
import { callbacks } from '../../../callbacks/server';
import { metrics } from '../../../metrics/server';
import * as CONSTANTS from '../../constants';
import { canSendMessage } from '../../../authorization/server';
import { SystemLogger } from '../../../logger/server';

import { sendStartCallJitsi } from '../streamerServer'

import { settings } from '../../../settings/server';






Meteor.methods({
	'jitsi:updateTimeout': async(rid, method = '') => {
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'jitsi:updateTimeout' });
		}

		const uid = Meteor.userId();

		const user = Users.findOneById(uid, {
			fields: {
				username: 1,
				type: 1,
			},
		});

		try {
			const room = canSendMessage(rid, { uid, username: user.username, type: user.type });

			const currentTime = new Date().getTime();

			const jitsiTimeout = room.jitsiTimeout && new Date(room.jitsiTimeout).getTime();

			const nextTimeOut = new Date(currentTime + CONSTANTS.TIMEOUT);



			if (!jitsiTimeout || currentTime > jitsiTimeout - CONSTANTS.TIMEOUT / 2 || method === 'update' || method === 'start') {
				Rooms.setJitsiTimeout(rid, nextTimeOut);
				if (method === '' && !jitsiTimeout) { method = 'start'}
			}

			const checkTimeOut = new Date(jitsiTimeout + 2 * CONSTANTS.TIMEOUT);

			const currentTime_checkTimeOut = currentTime > checkTimeOut

			let rcSession;

			//if (!jitsiTimeout || currentTime > jitsiTimeout) {
			if (!jitsiTimeout || currentTime > checkTimeOut || method === 'start') {

				//Старт звонка
				if (settings.get('JitsiCall_FSMeet_Enabled')) {
					const resfs = await sendStartCallJitsi(userId = uid, roomId = rid)
					rcSession = resfs.result.rc_session
					if (!rcSession) { 

						// console.log("++++++ERRRRRRRR resfs", resfs)
						// console.log("++++++ERRRRRRRR")
						const finishTimeOut = new Date(currentTime - CONSTANTS.TIMEOUT); //Минусуем таймаут что бы наверняка исключить повторное подключение

						Rooms.setJitsiTimeout(roomId, finishTimeOut);
						throw new Meteor.Error('error-not-allowed', 'Ошибка подключения к FSMeet, обратитесть в службу поддержки', { method: 'jitsi:updateTimeout' });

					}
				} else {
					sendStartCallJitsi(userId = uid, roomId = rid)
				}
				metrics.messagesSent.inc(); // TODO This line needs to be moved to it's proper place. See the comments on: https://github.com/RocketChat/Rocket.Chat/pull/5736

				const message = Messages.createWithTypeRoomIdMessageAndUser('jitsi_call_started', rid, `${rcSession}`, Meteor.user(), {
					actionLinks: [
						{ icon: 'icon-videocam', label: TAPi18n.__('Click_to_join'), method_id: 'joinJitsiCall', params: '', fsconf: "1111111111111" },
					],
				});
				message.msg = TAPi18n.__('Started_a_video_call');
				message.tmsg = `${rcSession}`
				// console.log("++++++++message", message)
				callbacks.run('afterSaveMessage', message, { ...room, jitsiTimeout: currentTime + CONSTANTS.TIMEOUT });





			}

			return jitsiTimeout || nextTimeOut;
		} catch (error) {
			SystemLogger.error('Error starting video call:', error);

			throw new Meteor.Error('error-starting-video-call', error.message);
		}
	},
});


Meteor.methods({
	'jitsi:deleteTimeout': ({ roomId, text, time }) => {

		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'jitsi:updateTimeout' });
		}

		const uid = Meteor.userId();

		const user = Users.findOneById(uid, {
			fields: {
				username: 1,
				type: 1,
			},
		});

		try {
			const room = canSendMessage(roomId, { uid, username: user.username, type: user.type });

			const currentTime = new Date().getTime();
			const nextTimeOut = new Date(currentTime - CONSTANTS.TIMEOUT); //Минусуем таймаут что бы наверняка исключить повторное подключение

			//const jitsiTimeout = new Date().getTime();

			Rooms.setJitsiTimeout(roomId, nextTimeOut);
			originalMessage = Messages.findOne({ rid: roomId, t: "jitsi_call_started" }, { sort: { ts: -1 } });
			originalMessage.text = text
			originalMessage.msg = text
			originalMessage.time = time

			delete originalMessage.actionLinks
			const tempid = originalMessage._id;
			Messages.update({ _id: tempid }, { $set: originalMessage });

		} catch (error) {
			SystemLogger.error('Error finishing video call:', error);

			throw new Meteor.Error('error-finishing-video-call', error.message);
		}
	},
});
// }


Meteor.methods({
	'fsmeet:callPost': async (apiName='', params={}) => {

		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'jitsi:updateTimeout' });
		}

		const uid = Meteor.userId();

		const user = Users.findOneById(uid, {
			fields: {
				username: 1,
				type: 1,
			},
		});

		try {
			const domain = settings.get('Jitsi_Domain');
			const fs_token = settings.get('JitsiCall_FSMeet_Token');
			
			const url = `https://${domain}${apiName}`
			const data = Object.assign({
				token: fs_token,
				username: user.username
			}, params);
			
			console.log("++++++fsmeet:callPost apiName",apiName)
			console.log("++++++fsmeet:callPost params",params)
			console.log("++++++fsmeet:callPost url",url)
			console.log("++++++fsmeet:callPost data",data)


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
			console.log("++++++fsmeet:callPost", resdata)

			if (resdata.result) {

				return resdata.result
			}

			if (resdata.error) {
				SystemLogger.error('Error fsmeet:callPost:', resdata.error);
		
				return {error: resdata.error.data.message}

			}
			

		} catch (error) {
			SystemLogger.error('Error fsmeet:callPost:', error);

			throw new Meteor.Error('error-fsmeet-callPost', error.message);
		}
	},
});
