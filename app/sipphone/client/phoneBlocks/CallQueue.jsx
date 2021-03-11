import React from 'react'
import {
  Modal,
  Box,
  Item,
  Content,
  Sidebar,
  Option,
  Button,
  Icon,
  Label,
} from '@rocket.chat/fuselage'

// const call_icon = "/icons/call-icon.svg"
// const end_icon = "/icons/end2-icon.svg"

export const CallQueue = ({ calls, handleAnswer, handleReject }) => {
  return (
    <Box display="flex" justifyContent="center">
      {calls.map((call) => {
        const parsedCaller = call.callNumber.split('-')
        return (
          <Box key={call.sessionId}>
            <Box>
              <dfn>Входящий вызов</dfn>
            </Box>
            <Label>
              {parsedCaller[0] ? parsedCaller[0] : null}
              {parsedCaller[1] ? parsedCaller[1] : null}
              {parsedCaller[2] ? parsedCaller[2] : null}
            </Label>
            <Button
              minWidth="x100"
              mi="x5"
              primary
              success
              onClick={() => handleAnswer(call.sessionId)}
            >
              <Icon name="phone" size="x20" />
            </Button>
            <Button
              mi="5"
              minWidth="x100"
              primary
              danger
              onClick={() => handleReject(call.sessionId)}
            >
              <Icon name="phone-off" size="x20" />
            </Button>
          </Box>
        )
      })}
    </Box>
  )
}

export default CallQueue
