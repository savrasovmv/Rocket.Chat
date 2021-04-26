import { Meteor } from 'meteor/meteor';

import { settings } from '../../settings';

Meteor.startup(function() {
	settings.addGroup('JitsiCall', function() {

		this.section('JitsiCall', function() {
			this.add('JitsiCall_Enabled', false, {
				type: 'boolean',
				i18nLabel: 'Enabled',
				alert: 'This Feature is currently in beta! Please report bugs to github.com/RocketChat/Rocket.Chat/issues',
				public: true,
			});

			this.add('JitsiCall_Domain', 'meet.jit.si', {
				type: 'string',
				enableQuery: {
					_id: 'JitsiCall_Enabled',
					value: true,
				},
				i18nLabel: 'Domain',
				public: true,
			});

			this.add('JitsiCall_URL_Room_Prefix', 'RocketChat', {
				type: 'string',
				enableQuery: {
					_id: 'JitsiCall_Enabled',
					value: true,
				},
				i18nLabel: 'URL_room_prefix',
				public: true,
			});

			this.add('JitsiCall_URL_Room_Suffix', '', {
				type: 'string',
				enableQuery: {
					_id: 'JitsiCall_Enabled',
					value: true,
				},
				i18nLabel: 'URL_room_suffix',
				public: true,
			});

			this.add('JitsiCall_URL_Room_Hash', true, {
				type: 'boolean',
				enableQuery: {
					_id: 'JitsiCall_Enabled',
					value: true,
				},
				i18nLabel: 'URL_room_hash',
				i18nDescription: 'URL_room_hash_description',
				public: true,
			});

			this.add('JitsiCall_SSL', true, {
				type: 'boolean',
				enableQuery: {
					_id: 'JitsiCall_Enabled',
					value: true,
				},
				i18nLabel: 'SSL',
				public: true,
			});

			this.add('JitsiCall_Open_New_Window', false, {
				type: 'boolean',
				enableQuery: {
					_id: 'JitsiCall_Enabled',
					value: true,
				},
				i18nLabel: 'Always_open_in_new_window',
				public: true,
			});

			this.add('JitsiCall_Enable_Channels', false, {
				type: 'boolean',
				enableQuery: {
					_id: 'JitsiCall_Enabled',
					value: true,
				},
				i18nLabel: 'Jitsi_Enable_Channels',
				public: true,
			});

			this.add('JitsiCall_Chrome_Extension', 'nocfbnnmjnndkbipkabodnheejiegccf', {
				type: 'string',
				enableQuery: {
					_id: 'JitsiCall_Enabled',
					value: true,
				},
				i18nLabel: 'Jitsi_Chrome_Extension',
				public: true,
			});

			this.add('JitsiCall_Enabled_TokenAuth', false, {
				type: 'boolean',
				enableQuery: {
					_id: 'JitsiCall_Enabled',
					value: true,
				},
				i18nLabel: 'JitsiCall_Enabled_TokenAuth',
				public: true,
			});

			this.add('JitsiCall_Application_ID', '', {
				type: 'string',
				enableQuery: [
					{ _id: 'JitsiCall_Enabled', value: true },
					{ _id: 'JitsiCall_Enabled_TokenAuth', value: true },
				],
				i18nLabel: 'Jitsi_Application_ID',
			});

			this.add('JitsiCall_Application_Secret', '', {
				type: 'string',
				enableQuery: [
					{ _id: 'JitsiCall_Enabled', value: true },
					{ _id: 'JitsiCall_Enabled_TokenAuth', value: true },
				],
				i18nLabel: 'Jitsi_Application_Secret',
			});

			this.add('JitsiCall_Limit_Token_To_Room', true, {
				type: 'boolean',
				enableQuery: [
					{ _id: 'JitsiCall_Enabled', value: true },
					{ _id: 'JitsiCall_Enabled_TokenAuth', value: true },
				],
				i18nLabel: 'Jitsi_Limit_Token_To_Room',
				public: true,
			});
			this.add('JitsiCall_timeOutInit', 10000, {
				type: 'int',
				enableQuery: [
					{ _id: 'JitsiCall_Enabled', value: true },
				],
				i18nLabel: 'Время ожидания инициализации подключение (мс)',
				public: true,
			});
			this.add('JitsiCall_timeOutCall', 10000, {
				type: 'int',
				enableQuery: [
					{ _id: 'JitsiCall_Enabled', value: true },
				],
				i18nLabel: 'Время звонка (мс)',
				public: true,
			});
			this.add('JitsiCall_timeOutNotifi', 3000, {
				type: 'int',
				enableQuery: [
					{ _id: 'JitsiCall_Enabled', value: true },
				],
				i18nLabel: 'Время показа сообщений отказ или неудачного подключений (мс)',
				public: true,
			});
		});
	});
});
