import { Meteor } from 'meteor/meteor';
import { jws } from 'jsrsasign';

import { Rooms } from '../../../models';
import { settings } from '../../../settings';
import { canAccessRoom } from '../../../authorization/server/functions/canAccessRoom';

Meteor.methods({
	'jitsiCall:generateAccessToken': (rid) => {
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'jitsiCall:generateToken' });
		}

		const room = Rooms.findOneById(rid);

		if (!canAccessRoom(room, Meteor.user())) {
			throw new Meteor.Error('error-not-allowed', 'not allowed', { method: 'jitsiCall:generateToken' });
		}

		let rname;
		if (settings.get('JitsiCall_URL_Room_Hash')) {
			rname = settings.get('uniqueID') + rid;
		} else {
			rname = encodeURIComponent(room.t === 'd' ? room.usernames.join(' x ') : room.name);
		}
		const jitsiRoom = settings.get('JitsiCall_URL_Room_Prefix') + rname + settings.get('JitsiCall_URL_Room_Suffix');
		const jitsiDomain = settings.get('JitsiCall_Domain');
		const jitsiApplicationId = settings.get('JitsiCall_Application_ID');
		const jitsiApplicationSecret = settings.get('JitsiCall_Application_Secret');
		const jitsiLimitTokenToRoom = settings.get('JitsiCall_Limit_Token_To_Room');

		function addUserContextToPayload(payload) {
			const user = Meteor.user();
			payload.context = {
				user: {
					name: user.name,
					email: user.emails[0].address,
					avatar: Meteor.absoluteUrl(`avatar/${ user.username }`),
					id: user._id,
				},
			};

			return payload;
		}

		const JITSI_OPTIONS = {
			jitsi_domain: jitsiDomain,
			jitsi_lifetime_token: '1hour', // only 1 hour (for security reasons)
			jitsi_application_id: jitsiApplicationId,
			jitsi_application_secret: jitsiApplicationSecret,
		};

		const HEADER = {
			typ: 'JWT',
			alg: 'HS256',
		};

		const commonPayload = {
			iss: JITSI_OPTIONS.jitsi_application_id,
			sub: JITSI_OPTIONS.jitsi_domain,
			iat: jws.IntDate.get('now'),
			nbf: jws.IntDate.get('now'),
			exp: jws.IntDate.get(`now + ${ JITSI_OPTIONS.jitsi_lifetime_token }`),
			aud: 'RocketChat',
			room: jitsiLimitTokenToRoom ? jitsiRoom : '*',
			context: '', // first empty
		};

		const header = JSON.stringify(HEADER);
		const payload = JSON.stringify(addUserContextToPayload(commonPayload));

		return jws.JWS.sign(HEADER.alg, header, payload, { rstr: JITSI_OPTIONS.jitsi_application_secret });
	},
});


export const generateAccessToken = (rid) => {
	if (!Meteor.userId()) {
		throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'jitsiCall:generateToken' });
	}

	const room = Rooms.findOneById(rid);

	if (!canAccessRoom(room, Meteor.user())) {
		throw new Meteor.Error('error-not-allowed', 'not allowed', { method: 'jitsiCall:generateToken' });
	}

	let rname;
	if (settings.get('JitsiCall_URL_Room_Hash')) {
		rname = settings.get('uniqueID') + rid;
	} else {
		rname = encodeURIComponent(room.t === 'd' ? room.usernames.join(' x ') : room.name);
	}
	const jitsiRoom = settings.get('JitsiCall_URL_Room_Prefix') + rname + settings.get('JitsiCall_URL_Room_Suffix');
	const jitsiDomain = settings.get('JitsiCall_Domain');
	const jitsiApplicationId = settings.get('JitsiCall_Application_ID');
	const jitsiApplicationSecret = settings.get('JitsiCall_Application_Secret');
	const jitsiLimitTokenToRoom = settings.get('JitsiCall_Limit_Token_To_Room');

	function addUserContextToPayload(payload) {
		const user = Meteor.user();
		payload.context = {
			user: {
				name: user.name,
				email: user.emails[0].address,
				avatar: Meteor.absoluteUrl(`avatar/${ user.username }`),
				id: user._id,
			},
		};

		return payload;
	}

	const JITSI_OPTIONS = {
		jitsi_domain: jitsiDomain,
		jitsi_lifetime_token: '1hour', // only 1 hour (for security reasons)
		jitsi_application_id: jitsiApplicationId,
		jitsi_application_secret: jitsiApplicationSecret,
	};

	const HEADER = {
		typ: 'JWT',
		alg: 'HS256',
	};

	const commonPayload = {
		iss: JITSI_OPTIONS.jitsi_application_id,
		sub: JITSI_OPTIONS.jitsi_domain,
		iat: jws.IntDate.get('now'),
		nbf: jws.IntDate.get('now'),
		exp: jws.IntDate.get(`now + ${ JITSI_OPTIONS.jitsi_lifetime_token }`),
		aud: 'RocketChat',
		room: jitsiLimitTokenToRoom ? jitsiRoom : '*',
		context: '', // first empty
	};

	const header = JSON.stringify(HEADER);
	const payload = JSON.stringify(addUserContextToPayload(commonPayload));

	return jws.JWS.sign(HEADER.alg, header, payload, { rstr: JITSI_OPTIONS.jitsi_application_secret });
}

export const generateMeetURL = (rid) => {
	//const rid = Session.get('openedRoom');
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



	const accessToken = isEnabledTokenAuth && generateAccessToken(rid);

	jitsiRoomActive = jitsiRoom;
	const queryString = accessToken ? `?jwt=${ accessToken }` : '';
	url = `${ (noSsl ? 'http://' : 'https://') + domain }/${ jitsiRoom }${ queryString }`
	return url


}
