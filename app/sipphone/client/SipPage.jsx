import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { SoftPhone } from './SoftPhone.jsx';
import { useSetting } from '../../../client/contexts/SettingsContext';

export const SipPage = () => {
  const showSipPhone = useSetting('SIPPhone_Enable');
  const domain = useSetting('SIPPhone_domain');
  const wsServers = useSetting('SIPPhone_ws_servers');
  const stunServers = useSetting('STUN_Servers');
  if (!showSipPhone || !domain || !wsServers) {
  	return (<div></div>)
  }
  return (
    <div className="flex-column">
    
        <SoftPhone/>
    </div>
  );
};

export default SipPage;