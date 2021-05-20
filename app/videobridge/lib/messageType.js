import { Meteor } from 'meteor/meteor';
import React from 'react';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';

import { MessageTypes } from '../../ui-utils';
//import { useSetting } from '../../../client/contexts/SettingsContext';
import { settings } from '../../settings';



	// const enabledJitsiCall = settings.get('JitsiCall_Enabled');

	// console.log('videobridge enabledJitsiCall', settings.get('JitsiCall_Enabled'))
	// //Если не включенны звонки то
	// if (!settings.get('JitsiCall_Enabled')) {
	// 	Meteor.startup(function() {
	// 		console.log('videobridge MessageTypes.registerType')
	// 		MessageTypes.registerType({
	// 			id: 'jitsi_call_started',
	// 			system: true,
	// 			message: TAPi18n.__('Started_a_video_call'),
	// 		});
	// 	});
	// }


