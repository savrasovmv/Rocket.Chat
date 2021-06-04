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

import { call } from '../../../ui-utils/client';
import { useSipContext } from './../SipContext'


export const SettingsTransferBlock = ({
  notify,
}) => {

  const {config, setConfig} = useSipContext()
  const [transferNumber, setTransferNumber] = useState(config.transferNumber)
  const [isTransfer, setIsTransfer] = useState(config.isTransfer)

  // const [isTransfer, setIsTransfer] = useState(false)
  // const [transferNumber, setTransferNumber] = useState('')

  const handleChecked = (event) => {
    setIsTransfer((prev) => !prev)

  }

  const setParamTransfer = async () => {
    res = await call('SIPPhone_set_param_transfer', config.authorization_user, isTransfer, transferNumber);
    return res
  }


  const handleSaveTransfer = (event) => {
    console.log("Новый номер переадресации", transferNumber)

    res = setParamTransfer()
    res.then((resolve) => {
      if (resolve === true) {
        setConfig((prevState) => ({
          ...prevState,
          isTransfer: isTransfer,
          transferNumber: transferNumber

        }))
        alert("Параметры переадресации обновлены")
      } else {
        console.log("Не удалось изменить параметры переадресации", JSON.stringify(resolve))
        alert("Не удалось изменить параметры переадресации " + JSON.stringify(resolve))
      }
    })
    res.catch(err => alert("111Не удалось изменить параметры переадресации " + err))


    // if (res === true) {
    //   setConfig((prevState) => ({
    //     ...prevState,
    //     isTransfer: isTransfer,
    //     transferNumber: transferNumber

    //   }))
    //   alert("Параметры переадресации обновлены")
    // } else {
    //   console.log("Не удалось изменить параметры переадресации", JSON.stringify(res))
    //   alert("Не удалось изменить параметры переадресации " + res)
    // }



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
        <NumberInput m="10px" disabled = { isTransfer ? false : true} defaultValue={transferNumber} onChange={(event) => setTransferNumber(event.target.value)} />
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
