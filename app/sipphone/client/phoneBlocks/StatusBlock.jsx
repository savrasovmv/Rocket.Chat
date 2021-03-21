import React, { useEffect, useState } from 'react'

import {
  Box,
  StatusBullet,
  Label,
  Icon,
  Avatar,
  Button,
} from '@rocket.chat/fuselage'

import { setStatusSIP } from './../lib/streamer'
export const StatusBlock = ({
  connectingPhone,
  connectedPhone,
  ipPhone,
  notify,
}) => {
  const [status, setStatus] = useState('offline')

  useEffect(() => {
    if (!connectingPhone) {
      setStatus(connectedPhone ? 'online' : 'offline')
      // if (!connectedPhone) {
      //   notify('Не удалось подключиться к серверу телефонии')
      // }
    } else {
      setStatus(false)
    }
    //setStatus(false)
  }, [connectingPhone, connectedPhone])

  useEffect(() => {
    console.log('Изменился СТАТУС:', status)
    //streamer.emit('message', status)
    if (status) {
      console.log('SEND status:', status)
      setStatusSIP(status)
    }

    // handleStatus(status)
  }, [status])

  return (
    <Box>
      {status ? <StatusBullet status={status} m="x10" /> : <StatusBullet />}
      <Label m="x10" fontSize="x16">
        {ipPhone} - {Meteor.user().name}
      </Label>
    </Box>
  )
}

export default StatusBlock
