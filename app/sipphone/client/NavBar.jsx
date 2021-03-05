import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { StatusBlock } from './phoneBlocks/StatusBlock';
import { Modal, Box, Item, Content, Sidebar, Option, Button, Icon } from '@rocket.chat/fuselage';

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
    <Box>
    <Button square value={isSettings}  onClick={handleSettingsButton}>
      <Icon name='cog' size='x20' />
    </Button>
  
    </Box>
  
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