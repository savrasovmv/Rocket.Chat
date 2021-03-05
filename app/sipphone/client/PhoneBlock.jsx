import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { SearchInput, Button, Icon } from '@rocket.chat/fuselage';
import { Modal, Box, Item, Content, Sidebar, Option, Label } from '@rocket.chat/fuselage';

import SearchList from '../../../client/sidebar/search/SearchList';
import { useOutsideClick } from '../../../client/hooks/useOutsideClick';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { APIClient } from '../../utils/client';

import { Users } from '../../models/client';

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
import { SearchBlock } from './phoneBlocks/SearchBlock.jsx';

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
                              setdialState,
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



  const handleSearchCall = (number='', event) => {
    console.log("handleSearchCall")
    console.log(number)
    setdialState(number)
    setUsers([])
    console.log(dialState)
    setOpenSearch(false)

    
  };


  const [openSearch, setOpenSearch] = useState(false);

  const [typeNumSearch, setTypeNumSearch] = useState(true);
  const [users, setUsers] = useState([]);
  const handleSearch = (event) => {
    setOpenSearch(true)
    setdialState(event.target.value)

    
  };


  useEffect(() => {
      if (openSearch) {
        const arr = [];
        console.log('Update search');
        if (dialState) {
          console.log("====================================");
          if(/^[0-9]+$/.test(dialState)){
            console.log('Введены цифры');
            setTypeNumSearch(true);
          } else {
            console.log('Введены буквы');
            setTypeNumSearch(false);

          }
          //"telephoneNumber":"telephoneNumber","ipPhone":"ipPhone","mobile":"mobile","homePhone":"homePhone"}
          const result =  APIClient.v1.get('users.list', 
                  {
                      query: '{ \
                                "$and":[\
                                        {"$or": [\
                                              {"ipPhone": {"$ne": null}},\
                                              {"telephoneNumber": {"$ne": null}},\
                                              {"mobile": {"$ne": null}},\
                                              {"homePhone": {"$ne": null}}\
                                              ]\
                                        },\
                                        {\
                                          "$or": [\
                                              {"ipPhone": {"$regex": "'+dialState+'" }},\
                                              {"telephoneNumber": {"$regex": "'+dialState+'" }},\
                                              {"mobile": {"$regex": "'+dialState+'" }},\
                                              {"homePhone": {"$regex": "'+dialState+'" }},\
                                              {"name": {"$regex": "'+dialState+'" , "$options": "i"}}\
                                              ] \
                                        }\
                                  ]\
                              }'
                  }

                  );
          console.log(result);
          console.log(result.resolve);
          result.then((resolve) =>{
            console.log("resolve");
            console.log(resolve);
            console.log(resolve.count);
            setUsers(resolve.users)

          })
          //const { PromiseResult: data = { users }, phase: status } =  APIClient.v1.get('users.list', {query: '{"ipPhone": {"$regex": "'+search+'" } }'});
          //console.log(status);
          //console.log(result.users);
          //users.forEach((user) => {

            //arr.push(user);
         
            
          //});

          //console.log("arr");
          //console.log(arr);

          //setUsers(result);
          //console.log(users.count());
        } else {
          setUsers([])

        }
      }

    }, [dialState]);



  
  const [searchOpen, setSearchOpen] = useState(false);

  // const viewRef = useRef();
  //const  users =  APIClient.v1.get('users.info', {username:"savrasovmv"})
  //const  users =  APIClient.v1.get('users.list', {query: '{"ipPhone": {"$regex": "11" } }'})
  //const  users =  APIClient.v1.get('spotlight', {})
  //console.log("====================================");
  //console.log(users);

   
  return (
        	<div >
            <div>
            	
            	
               
                <div className="flex-row"	>
                	
                  
                  {/*<SearchInput 
                        placeholder='Номер или имя абонента'
                        value={dialState}
                        onChange={handleDialStateChange} 
                  />*/}
                  <SearchInput 
                        maxWidth={500}
                        placeholder='Номер или имя абонента'
                        value={dialState}
                        onChange={handleSearch} 
                  />
                       
                  
                  { !inCall ? (
                    <Button primary success onClick={handleCall}> <Icon name='phone' size='x20' /></Button>
                    ) : ( null)}
                        
                  
                </div>




                <div className="flex-row" >
                    <div className="flex-column" >

                      <SearchBlock
                            handleSearchCall={handleSearchCall}
                            users={users}
                            typeNumSearch={typeNumSearch}
                            search={dialState}
                      />

                      
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
                                    style={{display: activeChannelNumber === displayCall.id ? ' block' : 'none',}}>


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
  setdialState: PropTypes.any,
  handleDialStateChange: PropTypes.any,
  setLocalStatePhone: PropTypes.any,
  setActiveChannel: PropTypes.any,
  localStatePhone: PropTypes.any,
  typeNumSearch: PropTypes.any,
  users: PropTypes.any,
  search: PropTypes.any

};

export default PhoneBlock;