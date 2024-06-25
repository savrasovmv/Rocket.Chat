import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { settings } from '../../app/settings';
import { hasPermission } from '../../app/authorization';
import { Users, Rooms } from '../../app/models';
import { RateLimiter } from '../../app/lib';
import { addUser } from '../../app/federation/server/functions/addUser';
import { createRoom } from '../../app/lib/server';
import { Messages } from '../../app/models';

Meteor.methods({
	forwardMessage(messageId, permalink, item) {
		// item - это либо комната или пользователь
		// permalink - ссылка на пересылаемое сообщение
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'reportMessage',
			});
		}
		
		check(messageId, String);
		const message = Messages.findOneById(messageId);

		if (!message) {
			throw new Meteor.Error('error-invalid-message_id', 'Invalid message id', {
				method: 'reportMessage',
			});
		}

		let rid = false
		let room = []

		// Если есть username значит это пользователь и нужно отправить в d
		if (item[0].username) {

			// Метод получает комнату:личную переписку или создает её
			const room_m =  Promise.await(
				Meteor.runAsUser(Meteor.userId(), () => Meteor.call('createDirectMessage', item[0].username))
			);
			room = Rooms.findOneById(room_m.rid);

		} else {
			// Это комната
			const roomId = item[0]._id
			check(roomId, String);
			room = Rooms.findOneById(roomId);
		}
		
		if (!room) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room forward', {
				method: 'reportMessage',
			});
		}
		
		// Изменяем оригинальное сообщение
		let msg = Object.assign(
			message,
			{
				_id: Random.id(),
				rid: room._id,
				ts: new Date(),
				msg: !message.attachments ? `[ ](${permalink})` : '',
			}
		);
		
		msg = Meteor.call('sendMessage', msg);
		
		return {
			rid: room._id,
			...room,
		};

	},
});

RateLimiter.limitMethod('forwardMessage', 10, 60000, {
	userId(userId) {
		return !hasPermission(userId, 'send-many-messages');
	},
});
