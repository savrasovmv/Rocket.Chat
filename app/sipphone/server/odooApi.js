import { settings } from '../../settings';


const Odoo = require('odoo-await');

const odoo_host = settings.get('SIPPhone_Server_Sync_Host')
const odoo_port = settings.get('SIPPhone_Server_Sync_Port_Host')
const odoo_username = settings.get('SIPPhone_Server_Sync_username')
const odoo_password = settings.get('SIPPhone_Server_Sync_password')
const odoo_db = settings.get('SIPPhone_Server_Sync_DB')


const odoo = new Odoo({
	baseUrl: odoo_host,
	port: odoo_port,
	db: odoo_db,
	username: odoo_username,
	password: odoo_password
});


export const getConfig = async (username) => {
	await odoo.connect();
	return await odoo.searchRead('fs.directory', [['username', 'ilike', username], ['active', '=', true]], ['number', 'regname', 'password', 'is_transfer', 'transfer_number'], { limit: 1 });
}
