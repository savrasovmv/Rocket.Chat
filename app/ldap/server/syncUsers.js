import { Meteor } from 'meteor/meteor';

//Savrasov добавил "sync_full" метод
import { sync,sync_full, sync_user } from './sync';
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

	// Синхронизация одного пользователя, вызывается из меню действий пользователя
	ldap_sync_user(userId) {
		check(userId, String);
		const udateUser = Meteor.users.findOne({ _id: userId }, { fields: { username: 1, services: 1 } });
		if (!udateUser) {
			throw new Meteor.Error('error-invalid-user', 'Не верный пользователь', { method: 'ldap_sync_user' });
		}
		const user = Meteor.user();
		if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'ldap_sync_user' });
		}

		if (!hasRole(user._id, 'admin')) {
			throw new Meteor.Error('error-not-authorized', 'Not authorized', { method: 'ldap_sync_user' });
		}

		if (settings.get('LDAP_Enable') !== true) {
			throw new Meteor.Error('LDAP_disabled');
		}

		Meteor.defer(() => {
			sync_user(udateUser)
		});

		return {
			message: 'Sync_in_progress',
			params: [],
		};
	},
	//End
});
