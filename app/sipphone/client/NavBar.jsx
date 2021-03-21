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

export const NavBar = ({
  connectingPhone,
  connectedPhone,
  setIsSettings,
  isSettings,
  ipPhone,
  notify,
}) => {
  const handleSettingsButton = (event) => {
    //console.log(isSettings)
    if (isSettings) {
      isSettings = false
    } else {
      isSettings = true
    }

    setIsSettings(isSettings)
    //console.log(isSettings)
  }
  return (
    <Sidebar.TopBar.Section>
      <StatusBlock
        connectedPhone={connectedPhone}
        connectingPhone={connectingPhone}
        ipPhone={ipPhone}
        notify={notify}
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
