import React, { useState, Fragment } from 'react'
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
  Avatar,
  Modal,
  Box,
  Item,
  Content,
  Sidebar,
  Option,
  Label,
  StatusBullet,
  Badge,
} from '@rocket.chat/fuselage'

import { getStatusSIP, getMissedSIP } from './lib/streamer'

export const SipPhone = () => {
  //const { status } = useSip()

  const [sipStatus, setSipStatus] = useState('offline')
  const [missed, setMissed] = useState(0)

  const sipPhoneRoute = useRoute('sipphone')
  const showSipPhone = useSetting('SIPPhone_Enable')
  const sipDomain = useSetting('SIPPhone_domain')
  const wsServers = useSetting('SIPPhone_ws_servers')
  const stunServers = useSetting('SIPPhone_STUN_Servers')

  const [isView, setIsView] = useState(false)
  const [isPhone, setIsPhone] = useState(false)

  if (!showSipPhone || !sipDomain || !wsServers) {
    console.log('Не определены параметры SIP')
    return
  }
  if (!isPhone) {
    const result = APIClient.v1.get('users.info', { userId: Meteor.userId() })
    result.then((resolve) => {
      const ipPhone = resolve.user.ipPhone
      if (ipPhone) {
        // console.log('Есть номера SIP:', ipPhone)
        setIsPhone(true)
      } else return
    })
  }

  const handleCall = (event) => {
    if (
      document.getElementsByClassName('sipphone-box')[0].style.display ===
        'flex' &&
      !isView
    ) {
      //console.log('Уже видимый')
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
      setMissed(0)
    }
    //event.persist();
  }

  const handleMissed = () => {
    console.log('GET MISSED')
    setMissed(missed + 1)
  }

  getStatusSIP(setSipStatus)
  getMissedSIP(handleMissed)

  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      //height="x36"
      mbs="x8"
      onClick={handleCall}
    >
      <Sidebar.Item clickable selected={isView}>
        <Sidebar.Item.Content>
          <Box marginInline="x10" marginBlock="x5">
            <Avatar size="x16" url="icons/call-icon.svg" />
          </Box>
          <Sidebar.Item.Title>
            <Box display="inline-flex">
              <Box marginInlineEnd="x10">
                <StatusBullet status={sipStatus} /> &nbsp;&nbsp;Телефон
              </Box>
              {missed > 0 ? (
                <Box size="x5">
                  <Badge variant="danger">{missed}</Badge>
                </Box>
              ) : null}
            </Box>
          </Sidebar.Item.Title>
        </Sidebar.Item.Content>
      </Sidebar.Item>
    </Box>
  )
}

export default React.memo(SipPhone)
