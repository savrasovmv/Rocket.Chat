import React, { useMemo } from 'react';
import {render} from 'react-dom';
import { useStableArray } from '@rocket.chat/fuselage-hooks';
import { Option, Badge } from '@rocket.chat/fuselage';

import { useSetting } from '../../../client/contexts/SettingsContext';
import { addAction, ToolboxActionConfig } from '../../../client/views/room/lib/Toolbox';
import { useTranslation } from '../../../client/contexts/TranslationContext';
import Header from '../../../client/components/Header';

import { connectToMeet } from '../lib/streamer'

import { modal, call } from '../../ui-utils/client';

import { Rooms } from '../../models';

const handleClick = () => {

	if (Session.get('openedRoom')) {

		const rid = Session.get('openedRoom');
		const room = Rooms.findOne({ _id: rid });
		const currentTime = new Date().getTime();
		const jitsiTimeout = new Date((room && room.jitsiTimeout) || currentTime).getTime();
		//Устанавливаем локальныу переменную, что бы знать с какого клиента идет вызов
		localStorage['JitsiCall_'+rid] = true
		if (jitsiTimeout > currentTime) {
			//ПРИСОЕДИНИТЬСЯ К КОНФЕРЕНЦИИ
			connectToMeet()
		} else {
			// НАЧИНАЕМ КОНФЕРЕНЦИЮ
			//sendStartCallJitsiToServer()
			call('jitsi:updateTimeout', rid, 'start');
		}
	}
}


addAction('jitsi_call', ({ room }) => {
	const enabled = useSetting('JitsiCall_Enabled');
	const t = useTranslation();

	const enabledChannel = useSetting('Jitsi_Enable_Channels');

	const groups = useStableArray([
		'direct',
		'group',
		'live',
		enabledChannel && 'channel',
	].filter(Boolean) as ToolboxActionConfig['groups']);

	const currentTime = new Date().getTime();
	const jitsiTimeout = new Date((room && room.jitsiTimeout) || currentTime).getTime();
	const live = jitsiTimeout > currentTime || null;

	return useMemo(() => (enabled ? {
		groups,
		id: 'jitsi_call',
		title: 'Вызов',
		icon: 'phone',
		action: handleClick,
		//template: 'videoFlexTab2',
		label: 'Вызов',
		order: live ? -1 : 0,
		//renderAction: (props): React.ReactNode => <JitsiCall handleCall={true} {...props}/>
		// renderAction: (props): React.ReactNode => <Header.ToolBoxAction {...props}>
		// 	{live && <Header.Badge title={t('Started_a_video_call')} variant='primary'>!</Header.Badge>}
		// </Header.ToolBoxAction>,
		// renderOption: ({ label: { title, icon }, ...props }: any): React.ReactNode => <Option label={title} title={title} icon={icon} {...props}>
		// 	{ live && <Badge title={t('Started_a_video_call')} variant='primary'>!</Badge> }
		// </Option>,

	} : null), [enabled, groups, live, t]);
});
