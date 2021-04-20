import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { TimeSync } from 'meteor/mizzao:timesync';

import { settings } from '../../../settings';
import { modal, call } from '../../../ui-utils/client';
import { t } from '../../../utils/client';
import { Users, Rooms } from '../../../models';
import * as CONSTANTS from '../../constants';
import { sendJitsiCallToServer } from '../../lib/streamer'

Template.videoFlexTab2.helpers({
	openInNewWindow() {
		return settings.get('JitsiCall_Open_New_Window');
	},
});

Template.videoFlexTab2.onCreated(function() {
	this.tabBar = Template.currentData().tabBar;
});
Template.videoFlexTab2.onDestroyed(function() {
	return this.stop && this.stop();
});

Template.videoFlexTab2.onRendered(function() {
	this.api = null;

	const rid = Session.get('openedRoom');

	const width = 'auto';
	const height = 500;

	const configOverwrite = {
		desktopSharingChromeExtId: settings.get('JitsiCall_Chrome_Extension'),
	};
	const interfaceConfigOverwrite = {};

	let jitsiRoomActive = null;

	const closePanel = () => {
		// Reset things.  Should probably be handled better in closeFlex()
		$('.flex-tab').css('max-width', '');
		$('.main-content').css('right', '');

		this.tabBar.close();

		// TabBar.updateButton('video', { class: '' });
	};

	const stop = () => {
		if (this.intervalHandler) {
			Meteor.defer(() => this.api && this.api.dispose());
			clearInterval(this.intervalHandler);
		}
	};

	this.stop = stop;

	const update = async () => {
		const { jitsiTimeout } = Rooms.findOne({ _id: rid }, { fields: { jitsiTimeout: 1 } });

		if (jitsiTimeout && (TimeSync.serverTime() - new Date(jitsiTimeout) + CONSTANTS.TIMEOUT < CONSTANTS.DEBOUNCE)) {
			return;
		}
		if (Meteor.status().connected) {
			return call('jitsiCall:updateTimeout', rid);
		}
		closePanel();
		return this.stop();
	};

	const start = async () => {
		try {
			const jitsiTimeout = await update();
			if (!jitsiTimeout) {
				return;
			}
			clearInterval(this.intervalHandler);
			this.intervalHandler = setInterval(update, CONSTANTS.HEARTBEAT);
			// TabBar.updateButton('video', { class: 'red' });
			return jitsiTimeout;
		} catch (error) {
			console.error(error);
			closePanel();
			throw error;
		}
	};

	modal.open({
		title: t('Video_Conference'),
		text: t('Start_video_call'),
		type: 'warning',
		showCancelButton: true,
		confirmButtonText: t('Yes'),
		cancelButtonText: t('Cancel'),
		html: false,
	}, (dismiss) => {
		if (!dismiss) {
			return closePanel();
		}
		this.intervalHandler = null;
		this.autorun(async () => {
			if (!settings.get('JitsiCall_Enabled')) {
				return closePanel();
			}

			if (!this.tabBar.isOpen()) {
				// TabBar.updateButton('video', { class: '' });
				return stop();
			}

			const domain = settings.get('JitsiCall_Domain');
			let rname;
			if (settings.get('JitsiCall_URL_Room_Hash')) {
				rname = settings.get('uniqueID') + rid;
			} else {
				const room = Rooms.findOne({ _id: rid });
				rname = encodeURIComponent(room.t === 'd' ? room.usernames.join(' x ') : room.name);
			}
			const jitsiRoom = settings.get('JitsiCall_URL_Room_Prefix') + rname + settings.get('JitsiCall_URL_Room_Suffix');
			const noSsl = !settings.get('JitsiCall_SSL');
			const isEnabledTokenAuth = settings.get('JitsiCall_Enabled_TokenAuth');

			if (jitsiRoomActive !== null && jitsiRoomActive !== jitsiRoom) {
				jitsiRoomActive = null;

				closePanel();

				return stop();
			}

			const accessToken = isEnabledTokenAuth && await call('jitsiCall:generateAccessToken', rid);

			jitsiRoomActive = jitsiRoom;

			if (settings.get('JitsiCall_Open_New_Window')) {
				return Tracker.nonreactive(async () => {
					await start();

					const queryString = accessToken ? `?jwt=${ accessToken }` : '';

					const newWindow = window.open(`${ (noSsl ? 'http://' : 'https://') + domain }/${ jitsiRoom }${ queryString }`, jitsiRoom);
					if (newWindow) {
						const closeInterval = setInterval(() => {
							if (newWindow.closed === false) {
								return;
							}
							closePanel();
							stop();
							clearInterval(closeInterval);
						}, 300);
						//console.log("4444444444444444444444", room.usernames)
						console.log("4444444444444444444444", rname)


						const jitsiUrl = `${ (noSsl ? 'http://' : 'https://') + domain }/${ jitsiRoom }${ queryString }`
						sendJitsiCallToServer(
												Meteor.userId(),
												rid,
												jitsiUrl
												 )
						console.log('SEND jitsi_url:', jitsiUrl)
						// //const streamerSipStatus = new Meteor.Streamer('sip')
						// const steamName = 'callJitsi'
						// const value = {
						// 	jitsi_url: jitsi_url,
						// 	userId: Meteor.userId(),
						// 	roomId: rid
						// }
						// streamerSipStatus.emit(steamName, value)

						// const steamName1 = Meteor.userId() + '/getJitsiCall'
						// streamerSipStatus.on(steamName1, function (status) {
						// 	console.log('getJitsiCall Server: ' + status)
						// 	//setFunc(status)
						// })


						return newWindow.focus();
					}
				});
			}

			if (typeof JitsiMeetExternalAPI !== 'undefined') {
				// Keep it from showing duplicates when re-evaluated on variable change.
				const name = Users.findOne(Meteor.userId(), { fields: { name: 1 } });
				if (!$('[id^=jitsiConference]').length) {
					Tracker.nonreactive(async () => {
						await start();

						this.api = new JitsiMeetExternalAPI(domain, jitsiRoom, width, height, this.$('.video-container').get(0), configOverwrite, interfaceConfigOverwrite, noSsl, accessToken);

						/*
						* Hack to send after frame is loaded.
						* postMessage converts to events in the jitsi meet iframe.
						* For some reason those aren't working right.
						*/
						setTimeout(() => this.api.executeCommand('displayName', [name]), 5000);
					});
				}

				// Execute any commands that might be reactive.  Like name changing.
				this.api && this.api.executeCommand('displayName', [name]);
			}
		});
	});
});
