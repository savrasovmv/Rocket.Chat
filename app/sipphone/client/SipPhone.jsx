import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';

import { Mongo } from 'meteor/mongo';
import { SideNavButton } from './SideNavButton.jsx';

import { useMutableCallback } from '@rocket.chat/fuselage-hooks';

import { useRoute } from '../../../client/contexts/RouterContext';
import { useSetting } from '../../../client/contexts/SettingsContext';

import { FlowRouter } from 'meteor/kadira:flow-router';

import { SoftPhone } from './SoftPhone.jsx';

export const SipPhone = () => {

  const sipPhoneRoute = useRoute('sipphone');
  const showSipPhone = useSetting('SIPPhone_Enable');
  const domain = useSetting('SIPPhone_domain');
  const wsServers = useSetting('SIPPhone_ws_servers');
  const stunServers = useSetting('STUN_Servers');

  const [isView, setIsView] = useState(false);
  const handleSipPhone = useMutableCallback(() => sipPhoneRoute.push({}));
  /*const handleSipPhone = (event) => {
        
        console.log("Click Call111:");
        //document.getElementsByClassName('sipphone-box')[0].style.visibility = 'hidden';
        
  };*/

  if (!showSipPhone || !domain || !wsServers) {return}

  console.log("Meteor.userId()")
  console.log(Meteor.userId())

  const handleCall = event => {
        //event.preventDefault();
        /*AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();*/

        console.log("Click Call:");
        if (isView) {
          document.getElementsByClassName('sipphone-box')[0].style.display = 'none';
          setIsView(false);
        } else {
          document.getElementsByClassName('sipphone-box')[0].style.display = 'block';
          setIsView(true);

        }
        //event.persist();
    
    };
    
  //return (<SideNavButton onClick={() => handleSipPhone()}/>);
  return (
    
    
      

      <div >
           <button className="rc-box rcx-box--full rcx-sidebar-item rcx-sidebar-item--clickable" onClick={handleCall}>
           
              <i className="icon-phone"></i>Телефон
           </button>

          
      </div>    
          
    
    );
      
  
};

export default React.memo(SipPhone);