import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { StatusBlock } from './phoneBlocks/StatusBlock';

//import './main.css';



export const NavBar = ({ connectingPhone ,connectedPhone}) => {
   
  return (
	<div className="sip-header">
    <div className="sip-navbar-container">
    	
    	
        	
        	<StatusBlock
              connectedPhone={connectedPhone}
              connectingPhone={connectingPhone}
          	/>
          	

       
        
    	
    	</div>
    </div>
  );
};

export default NavBar;