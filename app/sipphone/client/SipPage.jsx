import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { SoftPhone } from './SoftPhone.jsx';
import { useSetting } from '../../../client/contexts/SettingsContext';
import { Modal, Box, Item, Content, Sidebar, Option, Label, Grid, Tile } from '@rocket.chat/fuselage';

export const SipPage = () => {
  const showSipPhone = useSetting('SIPPhone_Enable');
  const domain = useSetting('SIPPhone_domain');
  const wsServers = useSetting('SIPPhone_ws_servers');
  const stunServers = useSetting('STUN_Servers');
  if (!showSipPhone || !domain || !wsServers) {
  	return (<div></div>)
  }
  return (
  	<div className="sipphone-box">
  		<div className="sip-page-container">
	
	    	

	        	<SoftPhone/>
	        
	    </div>
    </div>
  );
};

export default SipPage;