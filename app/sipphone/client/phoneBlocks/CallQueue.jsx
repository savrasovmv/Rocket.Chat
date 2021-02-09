import React from 'react';


export const CallQueue = ({ calls, handleAnswer, handleReject }) => {
  

  return (
    <div>
      {calls.map(call => {
        const parsedCaller = call.callNumber.split('-');
        return (
          <div key={call.sessionId}>
            
                <span>Входящий звонок от абонента</span>
                <p>{call.callNumber}</p>
                  
                <button onClick={handleAnswer} value={call.sessionId}>Answer</button>
          </div>

            
          
        );
      })}
    </div>
  );
}


export default CallQueue;
