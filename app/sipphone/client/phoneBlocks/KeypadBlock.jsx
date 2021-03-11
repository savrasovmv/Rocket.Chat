import React, { useState } from 'react'
import PropTypes from 'prop-types'

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
    <div className={style} onClick={() => handleName(value)}>
      {' '}
      {value}
    </div>
  )
}

export const KeypadBlock = ({ viewKeyPad, handlePressKey }) => {
  return (
    <div>
      {viewKeyPad ? (
        <div>
          <div>
            <KeypadButton value={1} handleName={handlePressKey} />
            <KeypadButton value={2} handleName={handlePressKey} />
            <KeypadButton value={3} handleName={handlePressKey} />
          </div>
          <div>
            <KeypadButton value={4} handleName={handlePressKey} />
            <KeypadButton value={5} handleName={handlePressKey} />
            <KeypadButton value={6} handleName={handlePressKey} />
          </div>
          <div>
            <KeypadButton value={7} handleName={handlePressKey} />
            <KeypadButton value={8} handleName={handlePressKey} />
            <KeypadButton value={9} handleName={handlePressKey} />
          </div>
          <div>
            <KeypadButton value={'*'} handleName={handlePressKey} />
            <KeypadButton value={0} handleName={handlePressKey} />
            <KeypadButton value={'#'} handleName={handlePressKey} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default KeypadBlock
