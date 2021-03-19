import React, { useState, useEffect } from 'react'
import { StatusBullet, Box } from '@rocket.chat/fuselage'

//import { useSip } from './SipContext'
//import { streamer } from './../db/SipNotification'
import { getStatusSIP } from './lib/streamer'

export const SipPhoneStatus = () => {
  const [sipStatus, setSipStatus] = useState('offline')
  // const { statusPhone, setStatusPhone } = useSip()
  // console.log('SipPhoneStatus:', statusPhone)
  // useEffect(() => {
  //   console.log('SipPhoneStatus useEffect:', statusPhone)
  //   setSipStatus(statusPhone)
  // }, [statusPhone])
  getStatusSIP(setSipStatus)
  // streamer.on('message1', function (sipStatusServer) {
  //   console.log('sipStatus Server: ' + sipStatusServer)
  //   setSipStatus(sipStatusServer)
  // })
  return (
    <Box>
      <StatusBullet status={sipStatus} />
    </Box>
  )
}
