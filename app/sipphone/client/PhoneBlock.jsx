import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';

import {  ButtonPanel, 
          CallButton, 
          EndButton, 
          HoldButton, 
          MicButton, 
          TransferButton, 
          AttendedTransferButton, 
          AttendedTransferButtonFinish, 
          DialButton} from './phoneBlocks/Buttons.jsx';
import { KeypadBlock } from './phoneBlocks/KeypadBlock.jsx';
import { InfoBlock } from './phoneBlocks/InfoBlock.jsx';
import { LineBlock } from './phoneBlocks/LineBlock.jsx';

const call_icon = "/icons/call-icon.svg"
const end_icon = "/icons/end-icon.svg"
const mute_icon = "/icons/mute-icon.svg"
const unmute_icon = "/icons/unmute-icon.svg"
const pause_icon = "/icons/pause-icon.svg"
const play_icon = "/icons/play-icon.svg"


//import './main.css';



export const LineButton = ({ localStatePhone, displayCall, handleTabLine, activeChannelNumber }) => {


  const [className, setclassName] = useState("tab-sipline ");

  useEffect(() => {

      console.log('----localStatePhone  BLOCK');
      newclassName = "tab-sipline ";
      if (activeChannelNumber === displayCall.id) {
          newclassName += " active ";
      }
      if (displayCall.inCall === true) {
          newclassName += " tab-sipline-incall ";
      }
      setclassName(newclassName);
      
      
    }, [localStatePhone, activeChannelNumber]);
 

  
  return (
    <div>

     
          <button className={className} value={displayCall.id}  onClick={handleTabLine}> 
              Линия  {displayCall.id+1} 
          </button>
       
       
    </div>
  );
}

export const PhoneBlock = ({ 
                              handleCallAttendedTransfer,
                              handleCallTransfer,
                              handleMicMute,
                              handleHold,
                              handleCall,
                              handleEndCall,
                              handlePressKey,
                              activeChannelNumber,
                              activeChannel,
                              handleSettingsButton,
                              dialState,
                              handleDialStateChange,
                              setLocalStatePhone,
                              setActiveChannel,
                              localStatePhone
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
        } = activeChannel;


  const [viewKeyPad, setView] = useState(false);

  
  const handleDial = (event) => {

      
      if (viewKeyPad === false) { 
          setView(true);
        } else {
          setView(false);
        }
      
    };


  const handleTabChange = (event, newValue) => {
    console.log("activeChannelNumber");
    console.log(activeChannelNumber);
    
    newValue=event.currentTarget.value;
    console.log("newValue");
    console.log(newValue);
    setActiveChannel(newValue);
  };

  const handleTabLine = (event, newValue) => {
    console.log("activeChannelNumber");
    console.log(activeChannelNumber);
    
    newValue=parseInt(event.currentTarget.value);
    //newValue=parseInt(event);
    console.log("newValue");
    console.log(newValue);
    setActiveChannel(newValue);
  };



  



   
  return (
        	<div >
            <div>
            	
            	
               
                <div className="flex-row"	>
                	
                  <input
                        className="input-field"
                        type="text"
                        placeholder="Номер или имя абонента"
                        value={dialState}
                        onChange={handleDialStateChange}
                  />

                       
                  { !inCall ? (<CallButton handleCall={handleCall}/>) : ( null)}
                        
                  
                </div>




                <div className="flex-row" >
                    <div className="flex-column" >
                  

                      
                      <div className="flex-row tab-sipline">
                        {localStatePhone.displayCalls.map((displayCall, key) => (

                              <div key={displayCall.id}>
                                    
                                    <LineButton 

                                                localStatePhone={localStatePhone}
                                                displayCall={displayCall} 
                                                handleTabLine={handleTabLine}
                                                activeChannelNumber={activeChannelNumber}
                                                 />
                                               

                              </div>
                          ))}

                      </div>

                      <div>
                        {localStatePhone.displayCalls.map((displayCall, key) => (

                              <div  key={displayCall.id} 
                                    style={{display: activeChannelNumber === displayCall.id ? ' inline-block' : 'none',}}>

                                    <div className="flex-row">
                                      <div>
                                        <DialButton handleDial={handleDial}/>
                                      </div>
                                      <div>
                                        <MicButton muted={muted} handleMicMute={handleMicMute}/>
                                      </div>
                                      <div>
                                        <HoldButton sessionId={displayCall.sessionId} hold={hold} handleHold={handleHold} />
                                      </div> 
                                          
                                          { displayCall.transferControl ? (
                                              <div>
                                                <AttendedTransferButtonFinish handleCallAttendedTransfer={handleCallAttendedTransfer} />
                                              </div>
                                            ) : null
                                          }

                                          { !displayCall.transferControl ? (
                                              <div>
                                                <TransferButton handleCallTransfer={handleCallTransfer} />
                                              </div>
                                            ) : null
                                          }
                                          { !displayCall.transferControl ? (
                                              <div>
                                                <AttendedTransferButton handleCallAttendedTransfer={handleCallAttendedTransfer} />
                                              </div>
                                            ) : null
                                          }

                                     
                                          
                                    </div>

                                    <div className="flex-row">
                                        <InfoBlock 
                                                displayCall={displayCall} 
                                                localStatePhone={localStatePhone} 
                                                activeChannelNumber={activeChannelNumber} 
                                                setActiveChannel={setActiveChannel}/>



                                    </div>
                                    { displayCall.inCall ? (
                                      <div className="flex-row">
                                        <EndButton sessionId={displayCall.sessionId} handleEndCall={handleEndCall}/>
                                      </div>
                                      ) : null
                                    }

                                    

                              </div>
                          ))}

                      </div>

                        
                    </div>
              

                </div>

                <div className="flex-row" >
                    
                    <KeypadBlock viewKeyPad={viewKeyPad} handlePressKey={handlePressKey}/>


                </div>

               
                
            	
            	</div>
            </div>
  );
};


PhoneBlock.propTypes = {
  handleCallAttendedTransfer: PropTypes.any,
  handleCallTransfer: PropTypes.any,
  handleMicMute: PropTypes.any,
  handleHold: PropTypes.any,
  handleCall: PropTypes.any,
  handleEndCall: PropTypes.any,
  handlePressKey: PropTypes.any,
  activeChannelNumber: PropTypes.any,
  activeChanel: PropTypes.any,
  keyVariant: PropTypes.any,
  handleSettingsButton: PropTypes.any,
  dialState: PropTypes.any,
  handleDialStateChange: PropTypes.any,
  setLocalStatePhone: PropTypes.any,
  setActiveChannel: PropTypes.any,
  localStatePhone: PropTypes.any

};

export default PhoneBlock;