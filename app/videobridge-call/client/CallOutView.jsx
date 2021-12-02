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
    Throbber,
    ButtonGroup,
    Avatar
  } from '@rocket.chat/fuselage'
//import { getRoomInfo } from '../lib/getInfoRoom'
import { APIClient } from '../../utils/client'




const ringerJitsiOut = createRef() //элемент для рингтона



export const CallOutView = ({infoCall, handleCancel}) => {

    const [avatarUrl, setAvatarUrl] = useState(false)
    const [info, setInfo] = useState(false)
    const [usersStatusInfo, setUsersStatusInfo] = useState([])
    const {members, status} = infoCall

    const setRejectStatus = (userId) => {
        if (userId) {
            const result = APIClient.v1.get('users.info', { userId: userId })
                result.then((resolve) => {

                    setUsersStatusInfo(prevState => [
                        prevState,
                        {
                            userName: resolve.user.name,
                            status: 'Отклонил'
                        }
                    ])
                })
        }
    }

    useEffect(() => {
        members.map((m) => {
            if (m.status === 'reject') {
                setRejectStatus(m.userId)
            }
        })
    }, [members])

    useEffect(() => {
        if (infoCall.roomId) {
            let callId // Id вызываемого юзера или группы
            let type
            if (infoCall.count===2) {
                type = 'user'
                infoCall.members.map((user) => {
                    if (user.userId !== infoCall.initUserId) {
                        callId = user.userId
                    }
                })
                const result = APIClient.v1.get('users.info', { userId: callId })
                result.then((resolve) => {
                    setInfo({
                        name: resolve.user.name,
                        title: resolve.user.title,
                        department: resolve.user.department,
                        username: resolve.user.username,
                        avatarUrl: '/avatar/'+resolve.user.username
                    })
                })
            }
            if (infoCall.count>2) {
                type = 'group'
                callId = infoCall.roomId
                const result = APIClient.v1.get('rooms.info', { roomId: callId })
                result.then((resolve) => {
                    setInfo({
                        name: resolve.room.fname,
                        title: false,
                        department: false,
                        username: false,
                        avatarUrl: '/avatar/room/'+resolve.room._id

                    })
                })
            }

        }

        try {
            ringerJitsiOut.current.src = '/callerRington.mp3'
            ringerJitsiOut.current.loop = true
            ringerJitsiOut.current.play();
          } catch (e) {
              console.log(e)
          }

    }, [])




    return (
        <Fragment>
            <Modal>
                {/* <Modal.Header>
                <Modal.Title>Исходящий вызов</Modal.Title>
                </Modal.Header> */}
                <Modal.Content>
                <Box display="flex" flexDirection="column" pbs='x20'>
                    <Box textAlign='center' fontSize="x16" pbe='x20'>
                        {info.roomName ? 'Конференция' : 'Исходящий звонок'}
                    </Box>
                    <Box display="flex" flexDirection="row">
                        <Box verticalAlign='middle'>
                            {info.avatarUrl ? (
                                <Avatar url={info.avatarUrl} size='x48' />
                            ):null}
                        </Box>
                        <Box pis='x15'>
                            <Label pbe='x8' fontSize="x16">
                                {info.name ? info.name : null }
                            </Label>
                            <Box  fontStyle='italic' fontSize='x12' lineHeight='1'>
                                {info.title ? info.title : null }
                            </Box>
                            <Box  fontStyle='italic' fontSize='x12' lineHeight='1'>
                                {info.department ? info.department : null }
                            </Box>

                        </Box>

                    </Box>

                </Box>

                    {usersStatusInfo.map((s, key) => {
                        return (
                            <Box key={key}>
                                {s.userName} - {s.status}
                            </Box>
                        )
                    })}


                </Modal.Content>
                <Modal.Footer>
                    {status === 'reject' ? (
                        <Box color='danger' textAlign='center'>
                            Пользователь отклонил вызов
                        </Box>

                    ): null}
                    {status === 'notAnswer' ? (
                        <Box color='danger' textAlign='center'>
                            Пользователь не отвечает
                        </Box>

                    ): null
                    }
                    {status === 'busy' ? (
                        <Box color='danger' textAlign='center'>
                            Пользователь занят
                        </Box>

                    ): null
                    }
                    {status === 'outCall' ? (
                        <ButtonGroup align='end'>
                            <Button onClick={() => handleCancel()}>Отменить</Button>
                        </ButtonGroup>

                    ): null
                    }

                </Modal.Footer>
            </Modal>
            <div hidden>
                <audio preload="auto" ref={ringerJitsiOut} />
            </div>
        </Fragment>
    )

}
