import { Meteor } from 'meteor/meteor';
import { settings } from '../../settings';
import { Users } from '../../models';
import { hasRole } from '../../authorization';

//import { jQuery } from 'jquery';


Meteor.methods({
	async SIPPhone_sync_test_connect() {
		const user = Meteor.user();
		if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'SIPPhone_sync_test_connect' });
		}

		if (!hasRole(user._id, 'admin')) {
			throw new Meteor.Error('error-not-authorized', 'Not authorized', { method: 'SIPPhone_sync_test_connect' });
		}

		if (settings.get('SIPPhone_Enable') !== true) {
			throw new Meteor.Error('SIPPhone_Disabled');
		}

        // const ses = await fetch(
        //     'http://127.0.0.1:8069/web/sesion/authenticate',
        //     {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //           },
        //         body: JSON.stringify(
        //             {
        //                 'jsonrpc': '2.0',
        //                 'params': {
        //                     'db': 'test',
        //                     'login': 'savrasovmv@tmenergo.ru',
        //                     'password': 'gfhjkm',
        //                 }
        //             })
        //     }
        // )

        const Odoo = require('odoo-await');

        const odoo = new Odoo({
            baseUrl: 'http://localhost',
            port: 8069,
            db: 'test',
            username: 'savrasovmv@tmenergo.ru',
            password: 'gfhjkm'
        });

        await odoo.connect();
        const records = await odoo.searchRead('fs.directory', [['username', '=', 'savrasovmv'], ['active', '=', true ]], ['regname', 'password'], {limit: 1});
        console.log(records);

        return records

        // let odoo = new Odoo('http://localhost:8069', 'test', 'savrasovmv@tmenergo.ru', 'gfhjkm')
        // await odoo.connect()

        // // Search partners
        // let directory = odoo.env('fs.directory')
        // let response = await directory.search_read([[['username', '=', 'savrasovmv']]], { limit: 1})
        // console.log(response)

        // const res = await fetch('http://127.0.0.1:8069/api_get_directory/savrasovmv')

        // rr = await res.json()
        // console.log(rr)
        // return rr


	},
});



Meteor.methods({
	'SIPPhone_get_params_connect': async () => {
		const user = Meteor.user();
		if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'SIPPhone_sync_test_connect' });
		}

		if (settings.get('SIPPhone_Enable') !== true) {
			throw new Meteor.Error('SIPPhone_Disabled');
		}

        const Odoo = require('odoo-await');

        const odoo = new Odoo({
            baseUrl: 'http://localhost',
            port: 8069,
            db: 'test',
            username: 'savrasovmv@tmenergo.ru',
            password: 'gfhjkm'
        });

        await odoo.connect();
        const records = await odoo.searchRead('fs.directory', [['username', '=', 'savrasovmv'], ['active', '=', true ]], ['regname', 'password'], {limit: 1});
        console.log(records);

        return records

	},
});


