import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { StatusBlock } from './phoneBlocks/StatusBlock';

//import './main.css';


export const SettingsButton = ({ isSettings, setIsSettings }) => {

  

  const handleSettingsButton = (event) => {
      //console.log(isSettings)
      if (isSettings) {
        isSettings = false;
      } else {
        isSettings = true;
      }

      setIsSettings(isSettings)
      
      
    };
   
  return (
  
    <div>
           <button className="panel-button panel-button-min" value={isSettings}  onClick={handleSettingsButton}>
                
                  Настройки

            </button>
      </div>
  
  );
};


export const NavBar = ({ connectingPhone ,connectedPhone, setIsSettings, isSettings}) => {

   
  return (
	<div className="sip-header">
    <div className="sip-navbar-container">
    	
    	
        	
        	<StatusBlock
              connectedPhone={connectedPhone}
              connectingPhone={connectingPhone}

          	/>


            <SettingsButton
              isSettings={isSettings}
              setIsSettings={setIsSettings}
            />



       
        
    	
    	</div>
    </div>
  );
};

export default NavBar;