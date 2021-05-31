import React, { useState, useEffect } from 'react'
import { Meteor } from 'meteor/meteor'
import { SoftPhone } from './SoftPhone.jsx'
import { useSetting } from '../../../client/contexts/SettingsContext'
import { APIClient } from '../../utils/client'
import { call } from '../../ui-utils/client';

import { WebSocketInterface } from 'jssip'
import { SipProvider, useSip } from './SipContext'

//console.log('Start STREAMER')

export const SipPage = () => {
  const [config, setConfig] = useState(false)
  const [ipPhone, setIpPhone] = useState(false)
  const showSipPhone = useSetting('SIPPhone_Enable')
  const sipDomain = useSetting('SIPPhone_domain')
  const prefix = useSetting('SIPPhone_prefix')
  const wsServers = useSetting('SIPPhone_ws_servers')
  const wsPort = useSetting('SIPPhone_ws_port')
  const stunServers = useSetting('SIPPhone_STUN_Servers')

  //.log('SipPage start')
  if (!showSipPhone || !sipDomain || !wsServers) {
    //console.log('SipPage Не определены параметры SIP')
    return <div></div>
  }

  Meteor.startup(async () => {
    const sipuser = await call('SIPPhone_get_params_connect');
    console.log('+++++++++++++++sipuser', sipuser)
    // const result = APIClient.v1.get('users.info', { userId: Meteor.userId() })
    // result.then((resolve) => {
    //   const resIpPhone = resolve.user.ipPhone

    //   if (!config && resIpPhone !== 'false') {
    //     setIpPhone(resIpPhone)
    //     if (ipPhone) {
    //       const sipuser = await call('SIPPhone_get_params_connect');
    //       console.log('+++++++++++++++sipuser', sipuser)
    //       setConfig({
    //         domain: sipDomain, //'fs2.fineapple.xyz', // sip-server@your-domain.io
    //         authorization_user: ipPhone + prefix,
    //         uri: 'sip:' + ipPhone + prefix + '@' + sipDomain, // sip:sip-user@your-domain.io
    //         password: 'Gfhjkm12@', //  PASSWORD ,
    //         ws_servers: 'https://' + wsServers + ':' + wsPort, //'https://fs2.fineapple.xyz:7443', //ws server
    //         sockets: new WebSocketInterface(
    //           'wss://' + sipDomain + ':' + wsPort
    //         ),
    //         display_name: ipPhone, //jssip Display Name
    //         debug: true, // Turn debug messages on
    //         stun_servers: stunServers.split(','),
    //         connection_recovery_min_interval: 30,
    //         connection_recovery_max_interval: 80,
    //       })
    //     }
    //   }
    // })
  })

  return config && ipPhone ? (
    <SipProvider>
      <SoftPhone config={config} ipPhone={ipPhone} />
    </SipProvider>
  ) : null
}

export default SipPage
