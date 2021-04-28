import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';

import { MessageTypes } from '../../ui-utils';



Meteor.startup(function() {
	MessageTypes.registerType({
		id: 'jitsi_call_call',
		system: true,
		message: 'jitsi_call_call',
		render(message) {
		//data(message) {
			console.log('message ', message)
			return `<svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg> <span style="color:rgba(0, 0, 0, 80%); font-weight:bold;font-size:115%"> ${ message.text} </span> ${ message.time}`
			//${ message.msg}
		},
	});
});



Meteor.startup(function() {
	MessageTypes.registerType({
		id: 'jitsi_call_started2',
		system: true,
		message: 'jitsi_call_started2',
		render(message) {
			return message.u._id === Meteor.userId() ?
					'<svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg> <span style="color:rgba(0, 0, 0, 80%); font-weight:bold;font-size:115%"> Исходящий вызов</span>'
					: '<svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg><span style="color:rgba(0, 0, 0, 80%); font-weight:bold;font-size:115%"> Входящий вызов</span>  '
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
					'<svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg> <span style="color:rgba(0, 0, 0, 80%); font-weight:bold;font-size:115%"> Нет ответа</span> '
					: '<svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg> <span style="font-weight:bold;font-size:115%;color: rgba(245, 69, 92, 100%)">Пропущеный звонок </span>'
		},
	});
});

Meteor.startup(function() {
	MessageTypes.registerType({
		id: 'jitsi_call_finished',
		system: true,
		message: TAPi18n.__('Вызов завершен'),
		render(message) {
			return '<svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg> <span style="color:rgba(0, 0, 0, 80%); font-weight:bold;font-size:115%"> Вызов завершен</span>'
		},
	});
});

Meteor.startup(function() {
	MessageTypes.registerType({
		id: 'jitsi_call_canceled',
		system: true,
		message: TAPi18n.__('Отменил вызов'),
		render(message) {
			return '<svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg> <span style="color:rgba(0, 0, 0, 80%); font-weight:bold;font-size:115%"> Звонок отклонен</span> '
		},
	});
});

Meteor.startup(function() {
	MessageTypes.registerType({
		id: 'jitsi_call_reject',
		system: true,
		message: TAPi18n.__('Отклонил вызов'),
		render(message) {
			return '<svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg> <span style="color:rgba(0, 0, 0, 80%); font-weight:bold;font-size:115%"> Отклонил вызов</span> '
		},
	});
});
