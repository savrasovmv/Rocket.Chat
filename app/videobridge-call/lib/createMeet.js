import { Meteor } from 'meteor/meteor';
import { settings } from '../../settings';
import { Session } from 'meteor/session';
import { modal, call } from '../../ui-utils/client';
import { Users, Rooms } from '../../models';


// export const createMeetURL = async (roomId) => {

// 	const rid = roomId ? roomId : Session.get('openedRoom');
// 	const domain = settings.get('JitsiCall_Domain');
// 	let rname;
// 	if (settings.get('JitsiCall_URL_Room_Hash')) {
// 		rname = settings.get('uniqueID') + rid;
// 	} else {
// 		const room = Rooms.findOne({ _id: rid });
// 		rname = encodeURIComponent(room.t === 'd' ? room.usernames.join(' x ') : room.name);
// 	}
// 	const jitsiRoom = settings.get('JitsiCall_URL_Room_Prefix') + rname + settings.get('JitsiCall_URL_Room_Suffix');
// 	const noSsl = !settings.get('JitsiCall_SSL');
// 	const isEnabledTokenAuth = settings.get('JitsiCall_Enabled_TokenAuth');



// 	const accessToken = isEnabledTokenAuth && await call('jitsiCall:generateAccessToken', rid);

// 	jitsiRoomActive = jitsiRoom;
// 	const queryString = accessToken ? `?jwt=${ accessToken }` : '';
// 	url = `${ (noSsl ? 'http://' : 'https://') + domain }/${ jitsiRoom }${ queryString }`
// 	return url


// }

export const getJitsiParam = async (roomId, rcSession) => {

	const rid = roomId ? roomId : Session.get('openedRoom');
	const domain = settings.get('Jitsi_Domain');
	let rname;
	if (settings.get('Jitsi_URL_Room_Hash')) {
		rname = settings.get('uniqueID') + rid;
	} else {
		const room = Rooms.findOne({ _id: rid });
		rname = encodeURIComponent(room.t === 'd' ? room.usernames.join(' x ') : room.name);
	}
	const jitsiRoom = settings.get('Jitsi_URL_Room_Prefix') + rname + settings.get('Jitsi_URL_Room_Suffix');
	const noSsl = !settings.get('Jitsi_SSL');
	const isEnabledTokenAuth = settings.get('Jitsi_Enabled_TokenAuth');



	const accessToken = isEnabledTokenAuth && await call('jitsi:generateAccessToken', rid, rcSession);

	jitsiRoomActive = jitsiRoom;
	const queryString = accessToken ? `?jwt=${ accessToken }` : '';
	if (settings.get('JitsiCall_FSMeet_Enabled')) {
		url = `${ (noSsl ? 'http://' : 'https://') + domain }/conference/rc/${ jitsiRoom }${ queryString }`
	} else {
		url = `${ (noSsl ? 'http://' : 'https://') + domain }/${ jitsiRoom }${ queryString }`
	}
	const el = document.getElementsByClassName('jitsi-container')[0]
	const options = {
		roomName: jitsiRoom,
		jwt: accessToken,
		height: '100%',
		width: '100%',
		parentNode: el,

	}
	return {
		domain: settings.get('JitsiCall_FSMeet_Enabled') ?`${domain}/conference/rc` : domain,
		options: options
	}


}
