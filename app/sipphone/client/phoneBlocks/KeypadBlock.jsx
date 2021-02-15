import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { ButtonPanel, CallButton, EndButton, HoldButton, MicButton, TransferButton, AttendedTransferButton, DialButton} from './Buttons.jsx';

const call_icon = "/icons/call-icon.svg"
const end_icon = "/icons/end-icon.svg"
const mute_icon = "/icons/mute-icon.svg"
const unmute_icon = "/icons/unmute-icon.svg"
const pause_icon = "/icons/pause-icon.svg"
const play_icon = "/icons/play-icon.svg"

export const KeypadButton = ({ 
              value,
              handleName,
              style='key-button'
              
         }) => {
  

  return (
      
        <div className={style} onClick={() => handleName(value)}> {value}</div>
      
  );
}





export const KeypadBlock = ({ 
              handleCallAttendedTransfer,
              handleCallTransfer,
              handlePressKey,
              handleMicMute,
              handleCall,
              handleEndCall,
              activeChanel,
              keyVariant = 'default',
              handleHold,
              dialState,
              handleDialStateChange
         }) => {

  
    const {
        inCall,
        muted,
        hold,
        sessionId,
        inAnswer,
        allowTransfer,
        allowAttendedTransfer,
        inAnswerTransfer,
        inConference,
        inTransfer,
        transferControl
      } = activeChanel;
  const [viewKeyPad, setView] = useState(false);
  
  const handleDial = (event) => {
      
      if (viewKeyPad === false) { 
          setView(true);
        } else {
          setView(false);
        }
      
    };


  return (
    <div>

      <div className="flex-container">
          <input
            className="input-field"
            type="text"
            placeholder="Номер или имя абонента"
            value={dialState}
            onChange={handleDialStateChange}
          />

          {inCall === false ? (
                <CallButton handleCall={handleCall}/>
                
           
              ) : (
                <EndButton handleEndCall={handleEndCall}/>
                
                
          )}
               

      </div> 
      
          
          { inAnswer ? (
              <div className="flex-container">
                  <DialButton handleDial={handleDial}/>
                  <MicButton muted={muted} handleMicMute={handleMicMute}/>
                  <HoldButton sessionId={sessionId} hold={hold} handleHold={handleHold} />
                  <TransferButton handleHold={handleCallTransfer} />
                  <AttendedTransferButton handleHold={handleCallAttendedTransfer} />
              </div>
            ):
              <div className="flex-container">
                <DialButton handleDial={handleDial}/>
              </div>

          }
      


      { viewKeyPad ? (
        <div >
          <div className="flex-container">
              <KeypadButton value={1} handleName={handlePressKey}/>
              <KeypadButton value={2} handleName={handlePressKey}/>
              <KeypadButton value={3} handleName={handlePressKey}/>
          </div>
          <div className="flex-container">
              <KeypadButton value={4} handleName={handlePressKey}/>
              <KeypadButton value={5} handleName={handlePressKey}/>
              <KeypadButton value={6} handleName={handlePressKey}/>
          </div>
          <div className="flex-container">
              <KeypadButton value={7} handleName={handlePressKey}/>
              <KeypadButton value={8} handleName={handlePressKey}/>
              <KeypadButton value={9} handleName={handlePressKey}/>
          </div>
          <div className="flex-container">
              <KeypadButton value={"*"} handleName={handlePressKey}/>
              <KeypadButton value={0} handleName={handlePressKey}/>
              <KeypadButton value={"#"} handleName={handlePressKey}/>
      
          </div>
        </div>
      ): null
    }
    </div>
  );
}

KeypadBlock.propTypes = {
  handleCallAttendedTransfer: PropTypes.any,
  handleCallTransfer: PropTypes.any,
  handlePressKey: PropTypes.any,
  handleMicMute: PropTypes.any,
  handleCall: PropTypes.any,
  handleEndCall: PropTypes.any,
  activeChanel: PropTypes.any,
  keyVariant: PropTypes.any,
  handleHold: PropTypes.any

};



export default KeypadBlock;
