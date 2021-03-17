import React, { useState, useEffect } from 'react'
import { Meteor } from 'meteor/meteor'
import { SoftPhone } from './SoftPhone.jsx'
import { useSetting } from '../../../client/contexts/SettingsContext'
import { APIClient } from '../../utils/client'
import {
  Modal,
  Box,
  Item,
  Content,
  Sidebar,
  Option,
  Label,
  Grid,
  Tile,
} from '@rocket.chat/fuselage'
import { WebSocketInterface } from 'jssip'

console.log('Start STREAMER')

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
    console.log('SipPage Не определены параметры SIP')
    return <div></div>
  }
  //console.log('SipPage end')
  // Meteor.call('sip.getHistory', [], (err, result) => {
  //   if (err) {
  //     console.log('err', err)
  //   } else {
  //     console.log(resolve(result))
  //   }
  // })
  //const history = APIClient.v1.get('getSipHistory', {})
  //console.log('getSipHistory', history)

  Meteor.startup(() => {
    // console.log('getSipHistory')
    // const history = APIClient.v1.get('sip.getHistory', {})
    // history.then((resolve) => {
    //   console.log('resolve', resolve)
    // })
    const result = APIClient.v1.get('users.info', { userId: Meteor.userId() })
    result.then((resolve) => {
      // console.log('++++++resolve++++')
      // console.log(resolve)
      // console.log(resolve.users)
      // console.log(resolve.user.ipPhone)
      const resIpPhone = resolve.user.ipPhone
      // console.log('ipPhone===', ipPhone)
      if (!config && resIpPhone !== 'false') {
        setIpPhone(resIpPhone)
        if (ipPhone) {
          setConfig({
            domain: sipDomain, //'fs2.fineapple.xyz', // sip-server@your-domain.io
            authorization_user: ipPhone + prefix,
            uri: 'sip:' + ipPhone + prefix + '@' + sipDomain, // sip:sip-user@your-domain.io
            password: 'Gfhjkm12@', //  PASSWORD ,
            ws_servers: 'https://' + wsServers + ':' + wsPort, //'https://fs2.fineapple.xyz:7443', //ws server
            sockets: new WebSocketInterface(
              'wss://' + sipDomain + ':' + wsPort
            ),
            display_name: ipPhone, //jssip Display Name
            debug: true, // Turn debug messages on
            stun_servers: stunServers.split(','),
            connection_recovery_min_interval: 30,
            connection_recovery_max_interval: 80,
          })
        }
      }
      // console.log('CONFIG')
      // console.log(config)
    })
  })

  return config && ipPhone ? (
    // <div className="sipphone-box">
    //   <div className="sip-page-container">
    //<Box bg="default" display="flex" flexDirection="column">

    <SoftPhone config={config} ipPhone={ipPhone} />
  ) : null
  //</Box>
  // </div>
  // </div>
  null
}

export default SipPage
