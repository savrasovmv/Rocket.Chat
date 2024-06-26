import React, { useEffect, useState } from 'react'
import {
  Modal,
  Box,
  Item,
  Content,
  Sidebar,
  Option,
  Button,
  Icon,
  Label,
  Divider
} from '@rocket.chat/fuselage'

import { SettingsTransferBlock } from './SettingsTransferBlock'

const call_icon = '/icons/call-icon.svg'
const end_icon = '/icons/end2-icon.svg'

export const SettingsBlock = ({
  localMediaDevices,
  audioElement,
  notify,
  hangleSettings,
  regname,
  isTransfer,
  transferNumber

}) => {
  //const [localMediaDevices, setlocalMediaDevices] = useState(false);
  const [defaultInDevices, setDefaultInDevices] = useState(
    localStorage.defaultInDevices
  )
  const [defaultOutDevices, setDefaultOutDevices] = useState(
    localStorage.defaultOutDevices
  )
  const [newInDevices, setNewInDevices] = useState()
  const [newOutDevices, setNewOutDevices] = useState()

  const handleInDevices = (event) => {
    //event.persist();
    const newDevicesId = event.currentTarget.value
    console.log(newDevicesId)
    setDefaultInDevices(newDevicesId)
  }

  const handleOutDevices = (event) => {
    //event.persist();
    const newDevicesId = event.currentTarget.value
    //console.log(newDevicesId)
    const promise = audioElement.setSinkId(newDevicesId)

    promise.then(
      function (result) {
        console.log('Audio output device sink ID is ' + newDevicesId)
        setDefaultOutDevices(newDevicesId)
      },
      function (e) {
        setDefaultOutDevices(defaultOutDevices)
        console.log('Ошибка назначения устройства аудиовыхода')
        console.log(e)
        notify('Ошибка назначения устройства аудиовыхода ' + e)
      }
    )
  }

  const handleSaveSettings = (event) => {
    //event.persist();
    //console.log('SAVE')

    localStorage.defaultInDevices = defaultInDevices
    localStorage.defaultOutDevices = defaultOutDevices
    hangleSettings()
  }

  return (
    <Box elevation='1'>
      <Sidebar.Section.Title>Настройки</Sidebar.Section.Title>
      <Sidebar.Item>
        <Sidebar.Item.Content>
          <Label>Микрофон:</Label>
          <select value={defaultInDevices} onChange={handleInDevices}>
            {localMediaDevices !== false
              ? localMediaDevices
                  .filter((devices) => devices.kind === 'audioinput')
                  .map((devices, key) => (
                    <option key={key} value={devices.deviceId}>
                      {devices.label}
                    </option>
                  ))
              : null}
          </select>
        </Sidebar.Item.Content>
      </Sidebar.Item>
      <Sidebar.Item>
        <Label>Аудиовыход:</Label>
        <select value={defaultOutDevices} onChange={handleOutDevices}>
          {localMediaDevices !== false
            ? localMediaDevices
                .filter((devices) => devices.kind === 'audiooutput')
                .map((devices, key) => (
                  <option key={key} value={devices.deviceId}>
                    {devices.label}
                  </option>
                ))
            : null}
        </select>
      </Sidebar.Item>
      <Sidebar.Item>
        <Button primary onClick={handleSaveSettings}>
          Сохранить
        </Button>
      </Sidebar.Item>

      <Divider />

      <SettingsTransferBlock/>

      <Divider />

    </Box>
  )
}

export default SettingsBlock
