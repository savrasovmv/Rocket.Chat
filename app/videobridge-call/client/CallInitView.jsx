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
export const CallInitView = () => {


    return (
        <Box>
            Соединение
            <Throbber />
        </Box>
    )

}
