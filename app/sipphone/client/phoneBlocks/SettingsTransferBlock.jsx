import React, { useEffect, useState } from 'react'
import {
  Box,
  Item,
  Content,
  Sidebar,
  Option,
  Button,
  Icon,
  Label,
  Field,
  NumberInput,
  CheckBox
} from '@rocket.chat/fuselage'


export const SettingsTransferBlock = ({
  notify,
  isTransfer,
  transferNumber

}) => {

  const [isTransfer, setIsTransfer] = useState(false)
  const [transferNumber, setTransferNumber] = useState('')

  const handleChecked = (event) => {
    setIsTransfer((prev) => !prev)

  }

  const handleSaveTransfer = (event) => {

  }



  return (
    <Box>
      <Sidebar.Section.Title>Переадресация</Sidebar.Section.Title>
      <Sidebar.Item>
        <Sidebar.Item.Content>

          <CheckBox checked = { isTransfer ? true : false} onChange={handleChecked} />
          <Label m="10px">Влючить переадресацию</Label>
        </Sidebar.Item.Content>
      </Sidebar.Item>
      <Sidebar.Item>
        <Label>На номер:</Label>
        <NumberInput m="10px" disabled = { isTransfer ? false : true} defaultValue={1024} />
      </Sidebar.Item>
      <Sidebar.Item>
        <Button primary onClick={handleSaveTransfer}>
          Сохранить
        </Button>
      </Sidebar.Item>
    </Box>
  )
}

export default SettingsTransferBlock
