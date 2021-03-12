import React, { useState } from 'react'
import { Meteor } from 'meteor/meteor'
import { StatusBlock } from './phoneBlocks/StatusBlock'
import {
  Modal,
  Box,
  Item,
  Content,
  Sidebar,
  Option,
  Button,
  Icon,
} from '@rocket.chat/fuselage'

//import './main.css';

// export const SettingsButton = ({ isSettings, setIsSettings }) => {
//   const handleSettingsButton = (event) => {
//     //console.log(isSettings)
//     if (isSettings) {
//       isSettings = false
//     } else {
//       isSettings = true
//     }

//     setIsSettings(isSettings)
//   }

//   return (
//     <Box>
//       <Button square value={isSettings} onClick={handleSettingsButton}>
//         <Icon name="cog" size="x20" />
//       </Button>
//     </Box>
//   )
// }

export const NavBar = ({
  connectingPhone,
  connectedPhone,
  setIsSettings,
  isSettings,
  ipPhone,
}) => {
  const handleSettingsButton = (event) => {
    //console.log(isSettings)
    if (isSettings) {
      isSettings = false
    } else {
      isSettings = true
    }

    setIsSettings(isSettings)
    console.log(isSettings)
  }
  return (
    <Sidebar.TopBar.Section>
      <StatusBlock
        connectedPhone={connectedPhone}
        connectingPhone={connectingPhone}
        ipPhone={ipPhone}
      />
      <Sidebar.TopBar.Actions>
        {/* <SettingsButton isSettings={isSettings} setIsSettings={setIsSettings} /> */}
        <Sidebar.TopBar.Action
          icon="customize"
          onClick={handleSettingsButton}
        />
      </Sidebar.TopBar.Actions>
    </Sidebar.TopBar.Section>
  )
}

export default NavBar
