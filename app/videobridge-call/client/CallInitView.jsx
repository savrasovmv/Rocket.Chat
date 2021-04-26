import React, { useState, Fragment, createRef,useEffect } from 'react'
import { Meteor } from 'meteor/meteor'
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
    Throbber
  } from '@rocket.chat/fuselage'

const ringerIn = createRef() //элемент для рингтона

// Вид инициализации вызова
export const CallInitView = ({status}) => {


    return (
        <Box width='x300' minWidth='x300' minHeight='x150' bg='surface'  p='x16' m='x16' textAlign='center' elevation='1' border='2px solid neutral-500' verticalAlign='middle'>
            Соединение
            <Throbber p='x16'/>
            {status==='notInit' ? (
                <Box p='x16' color='danger' textAlign='center'> Не удалось подключится. Абонент недоступен </Box>
            ):null}
            {status==='errorOpenWindows' ? (
                <Box p='x16' color='danger' textAlign='center'> Не возможно открыть окно конференции </Box>
            ):null}
        </Box>
    )

}
