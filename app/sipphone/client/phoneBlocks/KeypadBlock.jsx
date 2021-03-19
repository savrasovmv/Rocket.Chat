import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Box, Button } from '@rocket.chat/fuselage'
import {
  ButtonPanel,
  CallButton,
  EndButton,
  HoldButton,
  MicButton,
  TransferButton,
  AttendedTransferButton,
  DialButton,
} from './Buttons.jsx'

// const call_icon = "/icons/call-icon.svg"
// const end_icon = "/icons/end-icon.svg"
// const mute_icon = "/icons/mute-icon.svg"
// const unmute_icon = "/icons/unmute-icon.svg"
// const pause_icon = "/icons/pause-icon.svg"
// const play_icon = "/icons/play-icon.svg"

export const KeypadButton = ({ value, handleName, style = 'key-button' }) => {
  return (
    <Button square size="x64" margin="x1" onClick={() => handleName(value)}>
      {value}
    </Button>
  )
}

{
  /* <div className={style} onClick={() => handleName(value)}>
      {' '}
      {value}
    </div> */
}

export const KeypadBlock = ({ viewKeyPad = false, handlePressKey }) => {
  return viewKeyPad ? (
    <Box
      bg="neutral-500"
      p="x3"
      style={{
        position: 'absolute',
        zIndex: '3',
        insetInlineEnd: 'neg-x5',
        insetBlockStart: 'neg-x4',
      }}
    >
      <Box display="flex" flexDirection="column">
        <Box display="flex" flexDirection="row">
          <KeypadButton value={1} handleName={handlePressKey} />
          <KeypadButton value={2} handleName={handlePressKey} />
          <KeypadButton value={3} handleName={handlePressKey} />
        </Box>
        <Box display="flex" flexDirection="row">
          <KeypadButton value={4} handleName={handlePressKey} />
          <KeypadButton value={5} handleName={handlePressKey} />
          <KeypadButton value={6} handleName={handlePressKey} />
        </Box>
        <Box display="flex" flexDirection="row">
          <KeypadButton value={7} handleName={handlePressKey} />
          <KeypadButton value={8} handleName={handlePressKey} />
          <KeypadButton value={9} handleName={handlePressKey} />
        </Box>
        <Box display="flex" flexDirection="row">
          <KeypadButton value={'*'} handleName={handlePressKey} />
          <KeypadButton value={0} handleName={handlePressKey} />
          <KeypadButton value={'#'} handleName={handlePressKey} />
        </Box>
      </Box>
    </Box>
  ) : null
}

export default KeypadBlock
