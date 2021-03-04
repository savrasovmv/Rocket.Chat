import { settings } from '../../settings';

settings.addGroup('SIPPhone', function() {
	this.add('SIPPhone_Enable', false, {
		type: 'boolean',
		group: 'SIPPhone',
		public: true,
	});

	this.add('SIPPhone_domain', "fs2.fineapple.xyz", {
		type: 'string',
		group: 'SIPPhone',
		public: true,
	});
	this.add('SIPPhone_uri', "sip:1011@fs2.fineapple.xyz", {
		type: 'string',
		group: 'SIPPhone',
		public: true,
	});
	this.add('SIPPhone_ws_servers', "https://fs2.fineapple.xyz:7443", {
		type: 'string',
		group: 'SIPPhone',
		public: true,
	});
	
	return this.add('STUN_Servers', 'stun:stun.l.google.com:19302, stun:23.21.150.121, team%40rocket.chat:demo@turn:numb.viagenie.ca:3478', {
		type: 'string',
		group: 'SIPPhone',
		public: true,
	});
});
