import React from 'react';
const call_icon = "/icons/call-icon.svg"
const end_icon = "/icons/end2-icon.svg"

export const CallQueue = ({ calls, handleAnswer, handleReject }) => {


  

  return (
    <div className="flex-row">
      {calls.map(call => {
        const parsedCaller = call.callNumber.split('-');
        return (
          <div key={call.sessionId}>
            
                
                {parsedCaller[0] ? (<div>Вызов:{parsedCaller[0]}</div>):<div/>}
                {parsedCaller[1] ? (<div>Jurisdiction:{parsedCaller[1]}</div>):<div/>}
                {parsedCaller[2] ? (<div>Номер:{parsedCaller[2]}</div>):<div/>}
                
                  
                
                <button className="panel-button call-button panel-button-min" onClick={handleAnswer}  value={call.sessionId}>
                      
                      <img className="img-button" src={call_icon}/>
                              
                </button>
                <button className="panel-button end-button panel-button-min" onClick={handleReject} value={call.sessionId}>
                      
                      <img className="img-button" src={end_icon}/>
                              
                </button>
                
          </div>

            
          
        );
      })}
    </div>
  );
}


export default CallQueue;
