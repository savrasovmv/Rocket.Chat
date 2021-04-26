import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';

import { MessageTypes } from '../../ui-utils';

Meteor.startup(function() {
	MessageTypes.registerType({
		id: 'jitsi_call_started2',
		system: true,
		message: TAPi18n.__('Вызов конференции'),
	});
});

Meteor.startup(function() {
	MessageTypes.registerType({
		id: 'jitsi_call_finished',
		system: true,
		message: TAPi18n.__('Вызов завершен'),
	});
});

Meteor.startup(function() {
	MessageTypes.registerType({
		id: 'jitsi_call_canceled',
		system: true,
		message: TAPi18n.__('Отменил вызов'),
	});
});

Meteor.startup(function() {
	MessageTypes.registerType({
		id: 'jitsi_call_reject',
		system: true,
		message: TAPi18n.__('Отклонил вызов'),
	});
});
