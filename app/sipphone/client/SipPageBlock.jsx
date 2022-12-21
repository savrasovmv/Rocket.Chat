import React, { useState, useEffect, useMemo, useContext } from 'react'
import { Meteor } from 'meteor/meteor'
import { SoftPhone } from './SoftPhone.jsx'
import { useSetting } from '../../../client/contexts/SettingsContext'
import { APIClient } from '../../utils/client'
import { call } from '../../ui-utils/client';

import { WebSocketInterface } from 'jssip'
import { SipProvider, useSipContext, SipContext } from './SipContext'

import OutsideClickHandler from 'react-outside-click-handler';

import OutsideAlerter from './hooks/OutsideAlerter'

//console.log('Start STREAMER')

export const SipPageBlock = () => {

  const [connect, setConnect] = useState()
  const [connect2, setConnect2] = useState(1)
  const [connectAccess, setConnectAccess] = useState(false)
  const [intervalConnect, setIntervalConnect] = useState(10000)

  const {config, setConfig, ipPhone, setIpPhone} = useSipContext()

  useMemo(async () => {
    console.log('Запрос разрешения использовать телефон', Meteor.userId())

    const access = await call('SIPPhone_get_access');

    if (access) {
      console.log('Есть доступ к телефону')
      setConnectAccess(true)
    } else {
      console.log('Нет доступа к телефону')
    }

  }, [])



  const getConfig = async () => {
    console.log('getConfig', Meteor.userId())

    const configurations = await call('SIPPhone_get_params_connect');
    if (configurations) {
      console.log('Парамтры подключения телефона получены')
      configurations.sockets = new WebSocketInterface(configurations.sockets)

      setConfig(configurations)
      setIpPhone(configurations.display_name)
    } else {
      console.log('Парамтры подключения телефона не получены')
      const interval = setInterval(() => {

        console.log('Попытка подключения', connect2)

        if (connect2 > 5) {
          setIntervalConnect(60000)
        }

        setConnect2(connect2+1)
        clearInterval(interval)

      },[intervalConnect])
    }

  }

  useEffect( () => {

    console.log('Функция Запрос параметров', Meteor.userId())
    if (connectAccess) {
      console.log('Запрос параметров подключения телефона ....')
      getConfig()


    }


  }, [connectAccess,connect2])







  const outsideClick = () => {
    const htmlSoftPhoneBox = document.getElementsByClassName('sipphone-box')[0]
    const htmlRoomBox = document.getElementsByClassName('rc-old main-content content-background-color')[0]
    // alert("kkkkk")
    htmlSoftPhoneBox.style.display = 'none'
    htmlRoomBox.style.display = 'flex'
  }



  return (
    <OutsideClickHandler onOutsideClick={outsideClick}>
      {config && ipPhone ? <SoftPhone config={config} ipPhone={ipPhone} /> : <div>"Отсутствует конфигурация для подключения к телефонии"</div>}
    </OutsideClickHandler>
  )
}

export default SipPageBlock


{/*<OutsideClickHandler onOutsideClick={outsideClick}>
         <OutsideAlerter> */}
        {/* </OutsideAlerter>
      </OutsideClickHandler>*/}

  // Meteor.startup(async () => {
  //   const configurations = await call('SIPPhone_get_params_connect');
  //   console.log('+++++++++++++++sipuser', configurations)
  //   setConfig(configurations)
  //   setIpPhone(configurations.display_name)
  // })

