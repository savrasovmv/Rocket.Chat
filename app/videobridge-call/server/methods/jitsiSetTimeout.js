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


// console.log('videobridge-CALL JitsiCall_Enabled =============== ', settings.get('JitsiCall_Enabled'))
// if (settings.get('JitsiCall_Enabled')) {
// 	console.log('videobridge-CALL jitsi:updateTimeout ')
	Meteor.methods({
		'jitsi:updateTimeout': (rid, method='') => {
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
				}

				const checkTimeOut = new Date(jitsiTimeout + 2*CONSTANTS.TIMEOUT);

				const currentTime_checkTimeOut = currentTime > checkTimeOut

				console.log('-------------------------------------')
				console.log('----------updateTimeout--------------')
				console.log('jitsiTimeout ', jitsiTimeout)
				console.log('currentTime ', currentTime)
				console.log('checkTimeOut ', checkTimeOut)
				console.log('method ', method)
				console.log('currentTime_checkTimeOut ', currentTime_checkTimeOut)


				//if (!jitsiTimeout || currentTime > jitsiTimeout) {
				if (!jitsiTimeout || currentTime > checkTimeOut || method === 'start') {
					sendStartCallJitsi(userId=uid, roomId=rid) //Старт звонка
					metrics.messagesSent.inc(); // TODO This line needs to be moved to it's proper place. See the comments on: https://github.com/RocketChat/Rocket.Chat/pull/5736

					const message = Messages.createWithTypeRoomIdMessageAndUser('jitsi_call_started', rid, '', Meteor.user(), {
						actionLinks: [
							{ icon: 'icon-videocam', label: TAPi18n.__('Click_to_join'), method_id: 'joinJitsiCall', params: '' },
						],
					});
					message.msg = TAPi18n.__('Started_a_video_call');
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
		'jitsi:deleteTimeout': ({roomId, text, time}) => {
			console.log('jitsi:deleteTimeout', roomId)
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
				originalMessage = Messages.findOne({ rid: roomId, t: "jitsi_call_started"}, { sort: { ts: -1 } });
				originalMessage.text = text
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
