import React, { useState } from 'react'
import { Meteor } from 'meteor/meteor'

import { Mongo } from 'meteor/mongo'
import { SideNavButton } from './SideNavButton.jsx'

import { useMutableCallback } from '@rocket.chat/fuselage-hooks'

import { useRoute } from '../../../client/contexts/RouterContext'
import { useSetting } from '../../../client/contexts/SettingsContext'

import { FlowRouter } from 'meteor/kadira:flow-router'

import { SoftPhone } from './SoftPhone.jsx'
import { APIClient } from '../../utils/client'

import { SearchInput, Button, Icon } from '@rocket.chat/fuselage'
import {
  Modal,
  Box,
  Item,
  Content,
  Sidebar,
  Option,
  Label,
} from '@rocket.chat/fuselage'

export const SipPhone = () => {
  const sipPhoneRoute = useRoute('sipphone')
  const showSipPhone = useSetting('SIPPhone_Enable')
  const sipDomain = useSetting('SIPPhone_domain')
  const wsServers = useSetting('SIPPhone_ws_servers')
  const stunServers = useSetting('SIPPhone_STUN_Servers')

  const [isView, setIsView] = useState(false)
  const [isPhone, setIsPhone] = useState(false)
  const handleSipPhone = useMutableCallback(() => sipPhoneRoute.push({}))
  /*const handleSipPhone = (event) => {

        console.log("Click Call111:");
        //document.getElementsByClassName('sipphone-box')[0].style.visibility = 'hidden';

  };*/
  if (!showSipPhone || !sipDomain || !wsServers) {
    console.log('Не определены параметры SIP')
    return
  }
  if (!isPhone) {
    const result = APIClient.v1.get('users.info', { userId: Meteor.userId() })
    result.then((resolve) => {
      const ipPhone = resolve.user.ipPhone
      if (ipPhone) {
        console.log('Есть номера SIP:', ipPhone)
        setIsPhone(true)
      } else return
    })
  }

  // console.log('Meteor.userId()')
  // console.log(Meteor.user.ipPhone)
  // console.log(Meteor.user)

  const handleCall = (event) => {
    //event.preventDefault();
    /*AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();*/
    // var notification = new Notification('Notification title', {
    //   icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
    //   body: "Hey there! You've been notified!",
    //   requireInteraction: true, //Постоянно отображается
    //   //actions: [{ action: 'archive', title: 'Archive' }],
    // })
    // notification.onclick = function () {
    //   window.open('http://stackoverflow.com/a/13328397/1269037')
    // }

    console.log('Click Telephone isView', isView)
    if (
      document.getElementsByClassName('sipphone-box')[0].style.display ===
        'flex' &&
      !isView
    ) {
      console.log('Уже видимый')
      setIsView(true)
    }
    if (isView) {
      document.getElementsByClassName('sipphone-box')[0].style.display = 'none'
      document.getElementsByClassName(
        'rc-old main-content content-background-color'
      )[0].style.display = 'flex'
      setIsView(false)
    } else {
      document.getElementsByClassName('sipphone-box')[0].style.display = 'flex'
      document.getElementsByClassName(
        'rc-old main-content content-background-color'
      )[0].style.display = 'none'
      setIsView(true)
    }
    //event.persist();
  }

  return isPhone ? (
    <Box>
      <button
        className="rc-box rcx-box--full rcx-sidebar-item rcx-sidebar-item--clickable"
        onClick={handleCall}
      >
        <i className="icon-phone"></i>Телефон
      </button>
    </Box>
  ) : null
  //return (<SideNavButton onClick={() => handleSipPhone()}/>);
}

export default React.memo(SipPhone)
