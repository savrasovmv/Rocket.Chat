import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import _ from 'underscore';
import s from 'underscore.string';

import { Base } from './../../../models/server/models/_Base';
import Subscriptions from './../../../models/server/models/Subscriptions';
import { settings } from '../../../settings/server/functions/settings';
import { escapeRegExp } from '../../../../lib/escapeRegExp';


export class SipUsers extends Base {
	constructor(...args) {
		super(...args);

		this.defaultFields = {
			__rooms: 0,
		};

		this.tryEnsureIndex({ userId: 1 }, { sparse: 1 });

		this.tryEnsureIndex({ regname: 1 }, { sparse: 1 });
		this.tryEnsureIndex({ password: 1 });
		this.tryEnsureIndex({ active: 1 }, { sparse: 1 });
		this.tryEnsureIndex({ createdAt: 1 });
		this.tryEnsureIndex({ updateAt: 1 });
		this.tryEnsureIndex({ name: 1 }, { sparse: 1 });
		this.tryEnsureIndex({ username: 1 }, { sparse: 1 });
	}

    findOneByUsername(username, options) {
		const query = { username };

		return this.findOne(query, options);
	}

    findOneByUserId(userId, options) {
		const query = { userId };

		return this.findOne(query, options);
	}

    findOneByRegname(regname, options) {
		const query = { regname };

		return this.findOne(query, options);
	}

    setName(_id, name) {
		const update = {
			$set: {
				name,
			},
		};

		return this.update(_id, update);
	}

    setUsername(_id, username) {
		const update = {
			$set: {
				username,
			},
		};

		return this.update(_id, update);
	}

    setUserId(_id, userId) {
		const update = {
			$set: {
				userId,
			},
		};

		return this.update(_id, update);
	}

    setRegname(_id, regname) {
		const update = {
			$set: {
				regname,
			},
		};

		return this.update(_id, update);
	}

    setPassword(_id, password) {
		const update = {
			$set: {
				password,
			},
		};

		return this.update(_id, update);
	}

    setActive(_id, active) {
		const update = {
			$set: {
				active,
			},
		};

		return this.update(_id, update);
	}



    // INSERT
	create(data) {
		const user = {
			createdAt: new Date(),
		};

		_.extend(user, data);

		return this.insert(user);
	}


	// REMOVE
	removeById(_id) {
		return this.remove(_id);
	}



}

export default new SipUsers(Meteor.users, true);
