import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';

import { Rooms, Messages, Users } from '../../../models/server';
import { callbacks } from '../../../callbacks/server';
import { metrics } from '../../../metrics/server';
import * as CONSTANTS from '../../constants';
import { canSendMessage } from '../../../authorization/server';
import { SystemLogger } from '../../../logger/server';

Meteor.methods({
	'jitsiCall:sendMessage': (rid, messageName='jitsi_call_started2') => {
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'jitsiCall:updateTimeout' });
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

				metrics.messagesSent.inc(); // TODO This line needs to be moved to it's proper place. See the comments on: https://github.com/RocketChat/Rocket.Chat/pull/5736
				const mess = {
					msg: '111 Входящий вызов'

				};

				const message = Messages.createWithTypeRoomIdMessageAndUser(messageName, rid, '', Meteor.user(), {});
				//message.msg = TAPi18n.__('Входящий вызов');
				callbacks.run('afterSaveMessage', message, { ...room});

		} catch (error) {
			SystemLogger.error('Error starting video call:', error);

			throw new Meteor.Error('error-starting-video-call', error.message);
		}
	},
});
