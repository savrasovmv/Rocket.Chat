import { Meteor } from 'meteor/meteor';
import { settings } from '../../settings';
import { Session } from 'meteor/session';
import { modal, call } from '../../ui-utils/client';
import { Users, Rooms } from '../../models';


export const createMeetURL = async (roomId) => {

	const rid = roomId ? roomId : Session.get('openedRoom');
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



	const accessToken = isEnabledTokenAuth && await call('jitsiCall:generateAccessToken', rid);

	jitsiRoomActive = jitsiRoom;
	const queryString = accessToken ? `?jwt=${ accessToken }` : '';
	url = `${ (noSsl ? 'http://' : 'https://') + domain }/${ jitsiRoom }${ queryString }`
	return url


}
