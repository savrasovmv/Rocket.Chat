import React from 'react';




export const StatusBlock = ({ connectingPhone ,connectedPhone}) => {


  return (
    <div className="sip-navbar-container">
      
          Статус: 
     
          {
            !connectingPhone ? (connectedPhone
              ? <div className="sip-online" color="primary">ONLINE</div>
              : <div className="offline" color="primary">OFFLINE</div>
            ) : (!connectedPhone
              ? <div className="sip-online" color="primary">Подключение</div>
              : <div className="offline" color="primary">Неподключен</div>)
          }
          
    </div>

  );
}


export default StatusBlock;
