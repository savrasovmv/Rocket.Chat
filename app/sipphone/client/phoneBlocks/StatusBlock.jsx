import React, { useEffect, useState } from 'react'

import { Box, StatusBullet, Label, Icon, Avatar } from '@rocket.chat/fuselage'

export const StatusBlock = ({ connectingPhone, connectedPhone, ipPhone }) => {
  const [status, setStatus] = useState('offline')

  useEffect(() => {
    if (!connectingPhone) {
      setStatus(connectedPhone ? 'online' : 'offline')
    } else {
      setStatus(!connectedPhone ? false : 'busy')
    }
  }, [connectingPhone, connectedPhone])

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
