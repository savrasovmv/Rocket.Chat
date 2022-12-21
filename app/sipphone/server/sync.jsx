import { Meteor } from 'meteor/meteor';
import { settings } from '../../settings';
import { Users } from '../../models';
import { hasRole } from '../../authorization';
import { Logger } from '../../logger';

import { WebSocketInterface } from 'jssip'
import { connect } from 'nats';


//import { jQuery } from 'jquery';

export const logger = new Logger('SIP', {});

const odooApi = require('../server/odooApi')


Meteor.methods({
	async SIPPhone_sync_test_connect() {
		const user = Meteor.user();
		if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'SIPPhone_sync_test_connect' });
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
                if (!resolve) {return false}
                return true
            },
            reject => {
                return false
            }
        )

        if (!connect) {
            return false
        } else {
            return true
        }

	},
});


Meteor.methods({
	'SIPPhone_get_access': async () => {

		const user = Meteor.user();
		if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'SIPPhone_get_access' });
		}

		if (settings.get('SIPPhone_Enable') !== true) {
			return false
		}

        //Если это тестовый режим, перебираем имена пользователей
        if (settings.get('SIPPhone_Enable_Test_Mode')) {

            listUsers = settings.get('SIPPhone_List_Users_Test_Mode').split(',')

            if (Array.isArray(listUsers)) {
                res = listUsers.find((el) => el === user.username)
                return res ? true : false
            }

            return false
		}


        return true


	},
});


Meteor.methods({
	'SIPPhone_get_params_connect': async () => {
        uid = Meteor.userId()
        logger.info(`SIPPhone_get_params_connect uid ${ Meteor.userId() }`);
        if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-userID', 'Invalid userId', { method: 'SIPPhone_get_params_connect' });
		}

		const user = Meteor.user();
        logger.info(`SIPPhone_get_params_connect user ${ Meteor.user() }`);

		if (!user) {
            logger.info(`Нет user с uid ${ uid }`);

			const user = Users.findOneById(uid, {
                fields: {
                    username: 1,
                },
            });
		}

        if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'SIPPhone_get_params_connect' });
		}

		if (settings.get('SIPPhone_Enable') !== true) {
            logger.info("SIP SIPPhone_Enable FALSE return false");
			return false
		}

        logger.info("SIP odoo-await");

        // const Odoo = require('odoo-await');

        // const odoo_host = settings.get('SIPPhone_Server_Sync_Host')
        // const odoo_port = settings.get('SIPPhone_Server_Sync_Port_Host')
        // const odoo_username = settings.get('SIPPhone_Server_Sync_username')
        // const odoo_password = settings.get('SIPPhone_Server_Sync_password')
        // const odoo_db = settings.get('SIPPhone_Server_Sync_DB')

        // const odoo_connect_param = {
        //     baseUrl: odoo_host,
        //     port: odoo_port,
        //     db: odoo_db,
        //     username: odoo_username,
        //     password: odoo_password
        // }

        // const odoo = new Odoo({
        //     baseUrl: odoo_host,
        //     port: odoo_port,
        //     db: odoo_db,
        //     username: odoo_username,
        //     password: odoo_password
        // });

        logger.info("SIP Odoo проверка соединения");

        try {

            const records = await odooApi.getConfig(user.username);
            // await odoo.connect()
            // logger.info("SIP Odoo запрос получения конфигурации");
            // const records = await odoo.searchRead('fs.directory', [['username', 'ilike', user.username], ['active', '=', true ]], ['number','regname', 'password', 'is_transfer', 'transfer_number'], {limit: 1});

            if (!records || records.length === 0) {
                logger.info("SIP Odoo records FALSE");

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
                domain: sipDomain, //'fs2.your-domain.io', 
                authorization_user: regname,
                uri: 'sip:' + regname + '@' + sipDomain, // sip:sip-user@your-domain.io
                password: password, //  PASSWORD ,
                ws_servers: 'https://' + wsServers + ':' + wsPort, //'https://fs2.your-domain.io:7443', //ws server
                sockets: 'wss://' + wsServers + ':' + wsPort,
                display_name: number.toString(), //jssip Display Name
                debug: true, // Turn debug messages on
                stun_servers: stunServers.split(','),
                connection_recovery_min_interval: min_interval,
                connection_recovery_max_interval: max_interval,
                isTransfer: isTransfer,
                transferNumber: transferNumber
            }
            logger.info("SIP Odoo возврат конфигурации: ", config);

            return config

        } catch (e) {
            logger.warn("SIP Odoo ошибка: ", e);
            // throw new Meteor.Error('error-invalid-odoo-connect', 'Error connect Odoo', { method: 'SIPPhone_get_params_connect' });
        }

        // const connect = await odoo.connect()
        // .then(
        //     async resolve => {
        //         logger.info("SIP Odoo результат .... ");

        //         if (!resolve) {
        //             logger.info("SIP Odoo результат FALSE");

        //             return false
        //         }
        //         logger.info("SIP Odoo результат TRUE");

        //         return true
        //     },
        //     async reject => {
        //         logger.info("SIP Odoo результат REJECT");

        //         return false
        //     }
        // )

        // if (!connect) {
        //     logger.info("SIP Odoo connect FALSE");

        //     return false
        // }



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
                if (!resolve) {return false}
                return true
            },
            reject => {
                return false
            }
        )
        if (!connect) {
            return false
        }

        const action_update = await odoo.execute_kw('fs.directory', 'update_transfer_api', [[regname, isTransfer, transferNumber]])
        return action_update


	},
});


