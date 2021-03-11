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
      <Avatar
        url="https://www.flaticon.com/svg/vstatic/svg/15/15895.svg?token=exp=1615469038~hmac=d5cf489afbf64b1ba33a08fac31dfccf"
        size="x28"
      />
      {status ? <StatusBullet status={status} m="x10" /> : <StatusBullet />}
      <Label m="x10" fontSize="x20">
        {ipPhone}
      </Label>
    </Box>
  )
}

export default StatusBlock
