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
} from '@rocket.chat/fuselage'

const call_icon = '/icons/call-icon.svg'
const end_icon = '/icons/end2-icon.svg'

export const SettingsBlock = ({
  localMediaDevices,
  audioElement,
  notify,
  hangleSettings,
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
    console.log(newDevicesId)
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
    console.log('SAVE')

    localStorage.defaultInDevices = defaultInDevices
    localStorage.defaultOutDevices = defaultOutDevices
    hangleSettings()
  }

  return (
    <Sidebar.TopBar.ToolBox>
      <Sidebar.TopBar.Title>Настройки</Sidebar.TopBar.Title>

      <Sidebar.Item>
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
    </Sidebar.TopBar.ToolBox>
  )
}

export default SettingsBlock
