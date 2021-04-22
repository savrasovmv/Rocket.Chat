import { Meteor } from 'meteor/meteor'
import { getRoomAvatarURL } from '../../utils/lib/getRoomAvatarURL';
import { getUserAvatarURL } from '../../utils/lib/getUserAvatarURL';
import { Rooms } from '../../models/client';

const getRoomETag = (rid) => Rooms.findOne({ _id: rid }, { fields: { avatarETag: 1, name: 1 } });

// const getAvatarUrlGroup = (rid) => {
//     const { avatarETag, name } = getRoomETag(rid) || {};
//     const url = getRoomAvatarURL(rid, avatarETag);
//     console.log('AVATAR URL', url)
//     return url
// }

// const getUsername = ({ userId, username }) => {
// 	const query = {};
// 	if (username) {
// 		query.username = username;
// 	}

// 	if (userId) {
// 		query._id = userId;
// 	}

// 	const user = Meteor.users.findOne(query, { fields: { username: 1, avatarETag: 1, name: 1, title: 1 } });
// 	if (!user) {
// 		return {};
// 	}

// 	return user;
// };

// const getAvatarUrlUser = (userId) => {
//     console.log('getAvatarUrlUser id', userId)
//     const { username, avatarETag } = getUsername(userId);
//     console.log('getAvatarUrlUser username', username)
//     if (username) {
//         return getUserAvatarURL(username);
//     }
//     return;
// }


const getUsername = (userId) => {

	console.log('getUsername userId', userId)

	const query = {};

	if (userId) {
		query._id = userId;
	}

	const user = Meteor.users.findOne(query, { fields: { username: 1, avatarETag: 1, name: 1, title: 1 } });
	if (!user) {
		return {};
	}
	console.log('getUsername user', user)
	return user;
};

export const getRoomInfo = (type, callId) => {
	if (type === 'user') {

		if (username) {
			const url = getUserAvatarURL(username);
			const value = {
				username: username,
				name: name,
				title: title,
				avatarUrl: url
			}
			console.log('getRoomInfo', value)
			return value
		}
	} else {
		const { avatarETag, name } = getRoomETag(callId) || {};
		const url = getRoomAvatarURL(callId, avatarETag);
		const value = {
			username: false,
			name: name,
			title: false,
			avatarUrl: url
		}
		return value


	}
	return {
			username: false,
			name: false,
			title: false,
			avatarUrl: false

	}


}
