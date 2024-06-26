import { Meteor } from 'meteor/meteor';

//Savrasov добавил "sync_full" метод
import { sync,sync_full } from './sync';
import { hasRole } from '../../authorization';
import { settings } from '../../settings';

Meteor.methods({
	ldap_sync_now() {
		const user = Meteor.user();
		if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'ldap_sync_users' });
		}

		if (!hasRole(user._id, 'admin')) {
			throw new Meteor.Error('error-not-authorized', 'Not authorized', { method: 'ldap_sync_users' });
		}

		if (settings.get('LDAP_Enable') !== true) {
			throw new Meteor.Error('LDAP_disabled');
		}

		Meteor.defer(() => {
			sync();
		});

		return {
			message: 'Sync_in_progress',
			params: [],
		};
	},

	//Savrasov Start
	ldap_sync_now_full() {
		const user = Meteor.user();
		if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'ldap_sync_users' });
		}

		if (!hasRole(user._id, 'admin')) {
			throw new Meteor.Error('error-not-authorized', 'Not authorized', { method: 'ldap_sync_users' });
		}

		if (settings.get('LDAP_Enable') !== true) {
			throw new Meteor.Error('LDAP_disabled');
		}

		Meteor.defer(() => {
			sync_full();
		});

		return {
			message: 'Sync_in_progress',
			params: [],
		};
	},
	//End
});
