import React, { useState } from 'react';


const call_icon = "/icons/call-icon.svg"
const end_icon = "/icons/end2-icon.svg"
const mute_icon = "/icons/mute-icon.svg"
const unmute_icon = "/icons/unmute-icon.svg"
const pause_icon = "/icons/pause-icon.svg"
const play_icon = "/icons/play-icon.svg"
const transfer_icon = "/icons/transfer-icon.svg"
const attransfer_icon = "/icons/attransfer-icon.svg"
const keypad_icon = "/icons/keypad-icon.svg"


export const ButtonPanel = ({ name='', class_name, icon=false, handleName=false }) => {
  
  const temp_class_name = "panel-button " + class_name;
  return (
    <div>

      <button className={ temp_class_name } onClick={handleName}>
            
            <img className="img-button" src={icon}/>
            <p>{name}</p>
          
      </button>
 
         
    </div>
  );
}


export const CallButton = ({ handleCall }) => {
  
  return (
    <div>

      
      <button className="panel-button call-button panel-button-min" onClick={handleCall}>
            <div> <img className="img-button" src={call_icon}/></div>
                    
      </button>
       
    </div>
  );
}

export const EndButton = ({ sessionId, handleEndCall }) => {
  
  return (
    <div>

     
      <button className="panel-button end-button panel-button-min" value={sessionId} onClick={handleEndCall}>
            
            <img className="img-button" src={end_icon}/>
                    
      </button>
         
    </div>
  );
}

export const HoldButton = ({ hold, sessionId, handleHold }) => {
  const [icon, setIcon] = useState(pause_icon);
  const [name, setName] = useState("Удерживать");

  const handleH = (event) => {
      //event.persist();
      console.log(event)
      /*console.log(event.currentTarget.value)
      setdialState(dialState + event.currentTarget.value);*/
      if (hold === true) { 
          setIcon(pause_icon);
          setName("Удерживать");
          
        } else {
          setIcon(play_icon); 
          setName("Возобновить");
        }
      handleHold(sessionId, hold);
      
    };

  
  return (
    <div>
       
              <button className="panel-button " value={sessionId} onClick={handleH}>
                     <img className="img-button" src={icon}/>
                     <p>{ name }</p>
                 
                  

              </button>

     
       
    </div>
  );
}

export const MicButton = ({ muted, handleMicMute }) => {
  const [name, setValue] = useState('Mic off');
  const [icon, setIcon] = useState(mute_icon);

  const handleMic = (event) => {
      console.log(muted);
      if (muted === 0) { 
          setValue("Mic on");
          setIcon(unmute_icon);
          handleMicMute();
        } else {
          setValue("Mic off"); 
          setIcon(mute_icon);
          handleMicMute();
        }
      
    };

  return (
      <div>
           <button className="panel-button " onClick={handleMic}>
                <img className="img-button" src={icon}/>
                <p>{ name }</p>
            </button>
      </div>
      
        
      
  );
}


export const TransferButton = ({ handleCallTransfer }) => {
  const handleTransfer = (event) => {
      
      console.log("Click Trasfer")
      handleCallTransfer();

    };

  return (
      <div>
           <button className="panel-button " onClick={handleTransfer}>
                <img className="img-button" src={transfer_icon}/>
                <p>Перевод</p>
            </button>
      </div>
      
        
      
  );
}


export const AttendedTransferButton = ({ handleCallAttendedTransfer }) => {
  const handleAttendedTransfer = (event) => {
      
    
          handleCallAttendedTransfer('transfer', {});

    };

  return (
      <div>
           <button className="panel-button " onClick={handleAttendedTransfer}>
                <img className="img-button" src={attransfer_icon}/>
                <p>Сопров.</p>
                <p>Перевод</p>
            </button>
      </div>
      
        
      
  );
}

export const AttendedTransferButtonFinish = ({ handleCallAttendedTransfer }) => {
  const handleAttendedTransfer = (event) => {
      
    
          handleCallAttendedTransfer('finish', {});

    };

  return (
      <div>
           <button className="panel-button " onClick={handleAttendedTransfer}>
                <img className="img-button" src={attransfer_icon}/>
                <p>Завершить</p>
                <p>перевод</p>
            </button>
      </div>
      
        
      
  );
}

export const DialButton = ({ handleDial }) => {


  return (
      <div>
           <button className="panel-button " onClick={handleDial}>
                <img className="img-button" src={keypad_icon}/>

            </button>
      </div>
      
        
      
  );
}






export default ButtonPanel;