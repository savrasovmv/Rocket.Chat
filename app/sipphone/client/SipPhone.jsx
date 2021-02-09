import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { SideNavButton } from './SideNavButton.jsx';

import { useMutableCallback } from '@rocket.chat/fuselage-hooks';

import { useRoute } from '../../../client/contexts/RouterContext';
import { useSetting } from '../../../client/contexts/SettingsContext';

import { FlowRouter } from 'meteor/kadira:flow-router';

export const SipPhone = () => {

  const sipPhoneRoute = useRoute('sipphone');
  const showSipPhone = useSetting('SIPPhone_Enable');
  const handleSipPhone = useMutableCallback(() => sipPhoneRoute.push({}));
 /* const handleSipPhone = (event) => {
        
        console.log("Click Call111:");
        
    };*/

  const handleCall = event => {
        //event.preventDefault();
        /*AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();*/
        console.log("Click Call:");
        event.persist();
    
    };
    
  //return (<SideNavButton onClick={() => handleSipPhone()}/>);
  return (
    <div>
    <SideNavButton onClick={handleSipPhone}/>
    <div onClick={handleSipPhone}>Call</div> 
    </div>
    );
      
  
};

export default React.memo(SipPhone);