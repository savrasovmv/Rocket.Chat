import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';

import { getWorkspaceAccessToken } from '../../app/cloud/server';
import { hasRole } from '../../app/authorization';
import { settings } from '../../app/settings';
import { appTokensCollection, Push, PushVoIP } from '../../app/push/server';
import { Users } from '../../app/models/server';


Meteor.methods({
	push_test() {
		const user = Meteor.user();

		if (!user) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'push_test',
			});
		}

		if (!hasRole(user._id, 'admin')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'push_test',
			});
		}

		if (settings.get('Push_enable') !== true) {
			throw new Meteor.Error('error-push-disabled', 'Push is disabled', {
				method: 'push_test',
			});
		}


		const query = {
			$and: [{
				userId: user._id,
			}, {
				$or: [{
					'token.apn': {
						$exists: true,
					},
				}, {
					'token.gcm': {
						$exists: true,
					},
				}],
			}],
		};
		const tokens = appTokensCollection.find(query).count();

		if (tokens === 0) {
			throw new Meteor.Error('error-no-tokens-for-this-user', 'There are no tokens for this user', {
				method: 'push_test',
			});
		}

		Push.send({
			from: 'push',
			title: `@${ user.username }`,
			text: TAPi18n.__('This_is_a_push_test_messsage'),
			apn: {
				text: `@${ user.username }:\n${ TAPi18n.__('This_is_a_push_test_messsage') }`,
			},
			sound: 'default',
			userId: user._id,
		});

		return {
			message: 'Your_push_was_sent_to_s_devices',
			params: [tokens],
		};
	},
	push_test_voip() {
		console.debug("+++++push_test_voip")
		const username = settings.get('Push_test_send_username')
		if (!username) {
			throw new Meteor.Error('error-not-username', 'Not username from send push', {
				method: 'push_test_voip',
			});
		}
		let user;
		const userS = Users.findUsersByUsernames([username], { limit: 1 }).forEach((u) => {
			user = u;
		});
		if (!user) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'push_test_voip',
			});
		}


		// if (!hasRole(user._id, 'admin')) {
		// 	throw new Meteor.Error('error-not-allowed', 'Not allowed', {
		// 		method: 'push_test_voip',
		// 	});
		// }

		if (settings.get('Push_enable') !== true) {
			throw new Meteor.Error('error-push-disabled', 'Push is disabled', {
				method: 'push_test_voip',
			});
		}

		console.debug("+++++push_test_voip query user._id", user)

		const query = {
			$and: [{
				userId: user._id,
			}, {
				$or: [{
					'token.apnvoip': {
						$exists: true,
					},
				}, {
					'token.gcmvoip': {
						$exists: true,
					},
				}],
			}],
		};
		const tokens = appTokensCollection.find(query).count();
		console.debug("+++++push_test_voip tokens", tokens)
		if (tokens === 0) {
			throw new Meteor.Error('error-no-tokens-for-this-user', 'There are no tokens for this user', {
				method: 'push_test_voip',
			});
		}
		console.debug("+++++push_test_voip PushVoIP send")
		PushVoIP.send({
			from: 'push',
			title: `@${ user.username }`,
			text: TAPi18n.__('This_is_a_push_test_messsage'),
			apn: {
				text: `@${ user.username }:\n${ TAPi18n.__('This_is_a_push_test_messsage') }`,
				uuid: "db1dff98-bfef-4ec0-8ac6-8187a3b0c645",
                handle: "Jane Doe",
				callerName: "Jane Doe"
			},
			paylod: {
				uuid: "db1dff98-bfef-4ec0-8ac6-8187a3b0c645",
                handle: "Jane Doe",
				callerName: "Jane Doe"
			},
			sound: 'default',
			userId: user._id,
		});

		return {
			message: 'Your_push_was_sent_to_s_devices',
			params: [tokens],
		};
	},
});

function configurePush() {
	if (settings.get('Push_enable') === true) {
		let apn;
		let gcm;

		if (settings.get('Push_enable_gateway') === false) {
			gcm = {
				apiKey: settings.get('Push_gcm_api_key'),
				projectNumber: settings.get('Push_gcm_project_number'),
			};

			apn = {
				passphrase: settings.get('Push_apn_passphrase'),
				key: settings.get('Push_apn_key'),
				cert: settings.get('Push_apn_cert'),
			};

			if (settings.get('Push_production') !== true) {
				apn = {
					passphrase: settings.get('Push_apn_dev_passphrase'),
					key: settings.get('Push_apn_dev_key'),
					cert: settings.get('Push_apn_dev_cert'),
					gateway: 'gateway.sandbox.push.apple.com',
				};
			}


			apnvoip = {
				passphrase: settings.get('Push_apn_passphrase'),
				key: settings.get('Push_apn_key'),
				cert: settings.get('Push_apn_voip_cert'),
			};

			if (settings.get('Push_production') !== true) {
				apnvoip = {
					passphrase: settings.get('Push_apn_dev_passphrase'),
					key: settings.get('Push_apn_dev_key'),
					cert: settings.get('Push_apn_voip_cert'),
					gateway: 'gateway.sandbox.push.apple.com',
				};
			}

			if (!apn.key || apn.key.trim() === '' || !apn.cert || apn.cert.trim() === '') {
				apn = undefined;
			}

			if (!gcm.apiKey || gcm.apiKey.trim() === '' || !gcm.projectNumber || gcm.projectNumber.trim() === '') {
				gcm = undefined;
			}
		}

		Push.configure({
			apn,
			gcm,
			production: settings.get('Push_production'),
			gateways: settings.get('Push_enable_gateway') === true ? settings.get('Push_gateway').split('\n') : undefined,
			uniqueId: settings.get('uniqueID'),
			getAuthorization() {
				return `Bearer ${ getWorkspaceAccessToken() }`;
			},
		});
	}
}






//Savrasov
function configurePushVoIP() {
	if (settings.get('Push_enable') === true) {
		let apn;
		let gcm;

		if (settings.get('Push_enable_gateway') === false) {
			gcm = {
				apiKey: settings.get('Push_gcm_api_key'),
				projectNumber: settings.get('Push_gcm_project_number'),
			};

			apn = {
				passphrase: settings.get('Push_apn_passphrase'),
				key: settings.get('Push_apn_voip_cert'),
				cert: settings.get('Push_apn_voip_cert'),
				// keyId: '7UJQR385Z5',
    			// teamId: '533XUA38WU'
			};

			// apn = {
			// 	passphrase: settings.get('Push_apn_passphrase'),
			// 	key: settings.get('Push_apn_key'),
			// 	cert: settings.get('Push_apn_voip_cert'),
			// };

			// if (settings.get('Push_production') !== true) {
			// 	apn = {
			// 		passphrase: settings.get('Push_apn_dev_passphrase'),
			// 		key: settings.get('Push_apn_dev_key'),
			// 		cert: settings.get('Push_apn_voip_cert'),
			// 		gateway: 'gateway.sandbox.push.apple.com',
			// 	};
			// }

			if (!apn.key || apn.key.trim() === '' || !apn.cert || apn.cert.trim() === '') {
				apn = undefined;
			}

			if (!gcm.apiKey || gcm.apiKey.trim() === '' || !gcm.projectNumber || gcm.projectNumber.trim() === '') {
				gcm = undefined;
			}
		}

		PushVoIP.configure({
			apn,
			gcm,
			production: settings.get('Push_production'),
			gateways: settings.get('Push_enable_gateway') === true ? settings.get('Push_gateway').split('\n') : undefined,
			uniqueId: settings.get('uniqueID'),
			getAuthorization() {
				return `Bearer ${ getWorkspaceAccessToken() }`; 
			},
		});
	}
}










Meteor.startup(configurePush);
Meteor.startup(configurePushVoIP);






