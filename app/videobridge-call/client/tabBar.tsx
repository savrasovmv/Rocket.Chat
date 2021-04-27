import React, { useMemo } from 'react';
import {render} from 'react-dom';
import { useStableArray } from '@rocket.chat/fuselage-hooks';
import { Option, Badge } from '@rocket.chat/fuselage';

import { useSetting } from '../../../client/contexts/SettingsContext';
import { addAction, ToolboxActionConfig } from '../../../client/views/room/lib/Toolbox';
import { useTranslation } from '../../../client/contexts/TranslationContext';
import Header from '../../../client/components/Header';

import { sendStartCallJitsiToServer } from '../lib/streamer'

import { modal, call } from '../../ui-utils/client';

const handleClick = () => {
	//document.getElementsByClassName('jitsicall-box')[0].style.display = 'flex'
	console.log("JitsiCallClick ++++++++++++++++++++++++++++++++")
	sendStartCallJitsiToServer()


}


addAction('jitsi_call', ({ room }) => {
	const enabled = useSetting('JitsiCall_Enabled');
	const t = useTranslation();

	const enabledChannel = useSetting('JitsiCall_Enable_Channels');

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
