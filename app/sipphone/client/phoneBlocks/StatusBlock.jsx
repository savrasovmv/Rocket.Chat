import React from 'react';




export const StatusBlock = ({ connectingPhone ,connectedPhone}) => {


  return (
    <div className="root">
      
          <div id="continuous-slider">STATUS</div>
     
          {
            !connectingPhone ? (connectedPhone
              ? <div className="online" color="primary">ONLINE</div>
              : <div className="offline" color="primary">OFFLINE</div>
            ) : (!connectedPhone
              ? <div className="online" color="primary">CONNECTING</div>
              : <div className="offline" color="primary">DISCONNECTING</div>)
          }
       
    </div>

  );
}


export default StatusBlock;
