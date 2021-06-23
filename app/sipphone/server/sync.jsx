import { Meteor } from 'meteor/meteor';
import { settings } from '../../settings';
import { Users } from '../../models';
import { hasRole } from '../../authorization';

import { WebSocketInterface } from 'jssip'
import { connect } from 'nats';

//import { jQuery } from 'jquery';


Meteor.methods({
	async SIPPhone_sync_test_connect() {
		const user = Meteor.user();
		if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'SIPPhone_set_param_transfer' });
		}

		if (settings.get('SIPPhone_Enable') !== true) {
			return false
		}

        const Odoo = require('odoo-await');

        odoo_host = settings.get('SIPPhone_Server_Sync_Host')
        odoo_port = settings.get('SIPPhone_Server_Sync_Port_Host')
        odoo_username = settings.get('SIPPhone_Server_Sync_username')
        odoo_password = settings.get('SIPPhone_Server_Sync_password')
        odoo_db = settings.get('SIPPhone_Server_Sync_DB')

        console.log("+++++++++++++++ Connect ODOO ++++++++++++++++++++++")
        const odoo = new Odoo({
            baseUrl: odoo_host,
            port: odoo_port,
            db: odoo_db,
            username: odoo_username,
            password: odoo_password
        });

        const connect = await odoo.connect()
        .then(
            async resolve => {
                console.log("resolve")
                if (!resolve) {return false}
                return true
            },
            reject => {
                console.log("-------------------reject", reject)
                return false
            }
        )
        console.log("++++ Status Connection to Odoo", connect)
        if (!connect) {
            return false
        } else {
            return true
        }

	},
});



Meteor.methods({
	'SIPPhone_get_params_connect': async () => {
		const user = Meteor.user();
		if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'SIPPhone_get_params_connect' });
		}

		if (settings.get('SIPPhone_Enable') !== true) {
			return false
		}

        // stunServers = settings.get('SIPPhone_STUN_Servers')
        // config = {
        //     domain: '192.168.1.8', // sip-server@your-domain.io
        //     authorization_user: '110rc',
        //     uri: 'sip:110rc@192.168.1.8', // sip:sip-user@your-domain.io
        //     password: 'Gfhjkm12@', //  PASSWORD ,
        //     ws_servers: 'https://fsmin.fineapple.xyz:7443', //ws server
        //     sockets: 'wss://fsmin.fineapple.xyz:7443',
        //     display_name: '110', //jssip Display Name
        //     debug: true, // Turn debug messages on
        //     stun_servers: stunServers.split(','),
        //     connection_recovery_min_interval: 30,
        //     connection_recovery_max_interval: 80,
        // }
        // return config
        console.log("SIPPhone_get_params_connect");

        const Odoo = require('odoo-await');

        const odoo_host = settings.get('SIPPhone_Server_Sync_Host')
        const odoo_port = settings.get('SIPPhone_Server_Sync_Port_Host')
        const odoo_username = settings.get('SIPPhone_Server_Sync_username')
        const odoo_password = settings.get('SIPPhone_Server_Sync_password')
        const odoo_db = settings.get('SIPPhone_Server_Sync_DB')

        const odoo_connect_param = {
            baseUrl: odoo_host,
            port: odoo_port,
            db: odoo_db,
            username: odoo_username,
            password: odoo_password
        }

        console.log("+++++++++++++++ Connect ODOO  ++++++++++++++++++++++")
        console.log("+++ odoo_connect_param", odoo_connect_param)
        const odoo = new Odoo({
            baseUrl: odoo_host,
            port: odoo_port,
            db: odoo_db,
            username: odoo_username,
            password: odoo_password
        });

        const connect = await odoo.connect()
        .then(
            async resolve => {
                console.log("resolve")
                if (!resolve) {return false}
                return true
            },
            reject => {
                console.log("-------------------reject", reject)
                return false
            }
        )
        console.log("++++ Status Connection to Odoo", connect)
        if (!connect) {
            return false
        }
        console.log("start searchRead fs.directory")
        const records = await odoo.searchRead('fs.directory', [['username', '=', user.username], ['active', '=', true ]], ['number','regname', 'password', 'is_transfer', 'transfer_number'], {limit: 1});
        console.log(records);

        if (!records || records.length === 0) {
            return false
        }


        sipDomain = settings.get('SIPPhone_domain')
        wsServers = settings.get('SIPPhone_ws_servers')
        wsPort = settings.get('SIPPhone_ws_port')
        stunServers = settings.get('SIPPhone_STUN_Servers')
        min_interval = settings.get('SIPPhone_connection_recovery_min_interval')
        max_interval = settings.get('SIPPhone_connection_recovery_max_interval')
        regname = records[0].regname
        password = records[0].password
        number = records[0].number
        isTransfer = records[0].is_transfer
        transferNumber = records[0].transfer_number

        config = {
            domain: sipDomain, //'fs2.fineapple.xyz', // sip-server@your-domain.io
            authorization_user: regname,
            uri: 'sip:' + regname + '@' + sipDomain, // sip:sip-user@your-domain.io
            password: password, //  PASSWORD ,
            ws_servers: 'https://' + wsServers + ':' + wsPort, //'https://fs2.fineapple.xyz:7443', //ws server
            sockets: 'wss://' + wsServers + ':' + wsPort,
            display_name: number.toString(), //jssip Display Name
            debug: true, // Turn debug messages on
            stun_servers: stunServers.split(','),
            connection_recovery_min_interval: min_interval,
            connection_recovery_max_interval: max_interval,
            isTransfer: isTransfer,
            transferNumber: transferNumber
        }
        console.log("Config = ", config)
        return config


	},
});




Meteor.methods({
	'SIPPhone_set_param_transfer': async (regname, isTransfer, transferNumber) => {
		const user = Meteor.user();
		if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'SIPPhone_set_param_transfer' });
		}

		if (settings.get('SIPPhone_Enable') !== true) {
			return false
		}

        const Odoo = require('odoo-await');

        odoo_host = settings.get('SIPPhone_Server_Sync_Host')
        odoo_port = settings.get('SIPPhone_Server_Sync_Port_Host')
        odoo_username = settings.get('SIPPhone_Server_Sync_username')
        odoo_password = settings.get('SIPPhone_Server_Sync_password')
        odoo_db = settings.get('SIPPhone_Server_Sync_DB')

        console.log("+++++++++++++++ Connect ODOO ++++++++++++++++++++++")
        const odoo = new Odoo({
            baseUrl: odoo_host,
            port: odoo_port,
            db: odoo_db,
            username: odoo_username,
            password: odoo_password
        });

        const connect = await odoo.connect()
        .then(
            async resolve => {
                console.log("resolve")
                if (!resolve) {return false}
                return true
            },
            reject => {
                console.log("-------------------reject", reject)
                return false
            }
        )
        console.log("++++ Status Connection to Odoo", connect)
        if (!connect) {
            return false
        }

        const action_update = await odoo.execute_kw('fs.directory', 'update_transfer_api', [[regname, isTransfer, transferNumber]])
        console.log(action_update);
        return action_update


	},
});


