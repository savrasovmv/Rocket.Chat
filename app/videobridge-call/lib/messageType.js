import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';

import { MessageTypes } from '../../ui-utils';

Meteor.startup(function() {
	MessageTypes.registerType({
		id: 'jitsi_call_started2',
		system: true,
		message: 'jitsi_call_started2',
		render(message) {
			return message.u._id === Meteor.userId() ?
					'<svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg> Исходящий вызов'
					: '<svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg> Входящий вызов '
		},
	});
});


Meteor.startup(function() {
	MessageTypes.registerType({
		id: 'jitsi_call_notanswer',
		system: true,
		message: 'jitsi_call_notanswer',
		render(message) {
			return message.u._id === Meteor.userId() ?
					'<svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg> Нет ответа'
					: '<svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg> <span style="color: var(--rcx-color-danger-500-50, rgba(245, 69, 92, 50%))">Пропущен вызов </span>'
		},
	});
});

Meteor.startup(function() {
	MessageTypes.registerType({
		id: 'jitsi_call_finished',
		system: true,
		message: TAPi18n.__('Вызов завершен'),
		render(message) {
			return '<svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg> Вызов завершен'
		},
	});
});

Meteor.startup(function() {
	MessageTypes.registerType({
		id: 'jitsi_call_canceled',
		system: true,
		message: TAPi18n.__('Отменил вызов'),
		render(message) {
			return '<svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg> Отменил вызов'
		},
	});
});

Meteor.startup(function() {
	MessageTypes.registerType({
		id: 'jitsi_call_reject',
		system: true,
		message: TAPi18n.__('Отклонил вызов'),
		render(message) {
			return '<svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg> Отклонил вызов'
		},
	});
});
