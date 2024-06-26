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
  config
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
    //streamer.emit('message', status)
    if (status) {
      setStatusSIP(status)
    }

    // handleStatus(status)
  }, [status])

  return (
    <Box>
      {status ? <StatusBullet status={status} m="x10" /> : <StatusBullet />}
      <Label m="x10" fontSize="x16">
        {ipPhone} - {Meteor.user().name}
        {config.isTransfer ? (' - переадресация на: ' + config.transferNumber ): null}
      </Label>
    </Box>
  )
}

export default StatusBlock
