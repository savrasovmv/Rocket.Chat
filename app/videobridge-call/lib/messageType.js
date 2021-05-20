import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';

import { MessageTypes } from '../../ui-utils';
import { settings } from '../../settings';

Meteor.startup(function() {
	// const enabledJitsiCall = settings.get('JitsiCall_Enabled');
	// //Если включенны звонки то
	// if (enabledJitsiCall) {
		MessageTypes.registerType({
			id: 'jitsi_call_started',
			system: false,
			message: 'jitsi_call_started',
			extraData: {},
			data(message) {
				//message.hideActionLinks()
				return message
			},
			render(message) {
				message.actionLinks = null
				//message.hideActionLinks()
				if (message.text) {
					if (message.text === 'NotAnswer') {
						if (message.u._id === Meteor.userId()) {
							res = '<span style="font-weight: bold; font-size: 100%; color: rgba(0, 0, 0, 80%); "> Нет ответа</span>'
						} else {
							res = '<span style="font-weight: bold; font-size: 100%; color: rgba(245, 69, 92, 100%)">Пропущеный звонок </span>'
						}
					} else {
						if (message.time) {
							res = `<span style="font-weight: bold; font-size: 100%; color: rgba(0, 0, 0, 80%); "> ${ message.text} </span> <i> ${ message.time} </i>`
						} else {
							res = `<span style="font-weight: bold; font-size: 100%; color: rgba(0, 0, 0, 80%); "> ${ message.text} </span>`
						}

					}
				} else {
					res =  '<span style="font-weight: bold; font-size: 100%; color: rgba(0, 0, 0, 80%);">Звонок</span>'
				}

				return `<div style="position: relative; text-align: center;margin-right: 60px"><svg class="rc-icon" aria-hidden="true"><use 			xlink:href="#icon-phone"></use></svg> ${ res } </div>`


			},

		});
	// }
});




// Meteor.startup(function() {
// 	MessageTypes.registerType({
// 		id: 'jitsi_call_call',
// 		system: true,
// 		message: 'jitsi_call_call',
// 		render(message) {
// 		//data(message) {
// 			//console.log('message ', message)
// 			return `<svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg> <span style="color:rgba(0, 0, 0, 80%); font-weight:bold;font-size:115%"> ${ message.text} </span> ${ message.time}`
// 			//${ message.msg}
// 		},
// 	});
// });



// Meteor.startup(function() {
// 	MessageTypes.registerType({
// 		id: 'jitsi_call_started2',
// 		system: true,
// 		message: 'jitsi_call_started2',
// 		render(message) {
// 			return message.u._id === Meteor.userId() ?
// 					'<svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg> <span style="color:rgba(0, 0, 0, 80%); font-weight:bold;font-size:115%"> Исходящий вызов</span>'
// 					: '<svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg><span style="color:rgba(0, 0, 0, 80%); font-weight:bold;font-size:115%"> Входящий вызов</span>  '
// 		},
// 	});
// });


// Meteor.startup(function() {
// 	MessageTypes.registerType({
// 		id: 'jitsi_call_notanswer',
// 		system: true,
// 		message: 'jitsi_call_notanswer',
// 		render(message) {
// 			return message.u._id === Meteor.userId() ?
// 					'<svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg> <span style="color:rgba(0, 0, 0, 80%); font-weight:bold;font-size:115%"> Нет ответа</span> '
// 					: '<svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg> <span style="font-weight:bold;font-size:115%;color: rgba(245, 69, 92, 100%)">Пропущеный звонок </span>'
// 		},
// 	});
// });

// Meteor.startup(function() {
// 	MessageTypes.registerType({
// 		id: 'jitsi_call_finished',
// 		system: true,
// 		message: TAPi18n.__('Вызов завершен'),
// 		render(message) {
// 			return '<svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg> <span style="color:rgba(0, 0, 0, 80%); font-weight:bold;font-size:115%"> Вызов завершен</span>'
// 		},
// 	});
// });

// Meteor.startup(function() {
// 	MessageTypes.registerType({
// 		id: 'jitsi_call_canceled',
// 		system: true,
// 		message: TAPi18n.__('Отменил вызов'),
// 		render(message) {
// 			return '<svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg> <span style="color:rgba(0, 0, 0, 80%); font-weight:bold;font-size:115%"> Звонок отклонен</span> '
// 		},
// 	});
// });

// Meteor.startup(function() {
// 	MessageTypes.registerType({
// 		id: 'jitsi_call_reject',
// 		system: true,
// 		message: TAPi18n.__('Отклонил вызов'),
// 		render(message) {
// 			return '<div style="position: relative; text-align: center;margin-right: 60px"><svg class="rc-icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg> <span style="color:rgba(0, 0, 0, 80%); font-weight:bold;font-size:100%"> Отклонил звонок</span> </div>'
// 		},
// 	});
// });
