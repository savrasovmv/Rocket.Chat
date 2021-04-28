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
import { APIClient } from '../../utils/client'
import { settings } from '../../settings';

//const timeOutCall = settings.get('JitsiCall_timeOutCall')

//const ringerJitsiIn = createRef() //элемент для рингтона

Notification.requestPermission()

export const CallInView = ({infoCall, handleAnswer, handleReject, timeOutCall}) => {

    console.log('CallInView render')

    const [info, setInfo] = useState({
        name: false,
        title: false,
        department: false,
        username: false,
        avatarUrl: false,
        roomName: false
    })

    const ringerJitsiIn = createRef() //элемент для рингтона

    const viewNotification = () => {
        console.log(" viewNotification +++++++++++++++++++++++")

            console.log("+++++++++++++++++++++++", info)
            const notification = new Notification('Входящий вызов', {
                requireInteraction: true, //Постоянно отображается
                icon: '/call-icon.png',
                body: `Входящий вызов: ${
                    info.name
                }`,
            })


        // notification.onclick = function () {
        //     document.getElementsByClassName('sipphone-box')[0].style.display =
        //     'flex'
        //     document.getElementsByClassName(
        //     'rc-old main-content content-background-color'
        //     )[0].style.display = 'none'

        //     handleAnswer(payload.id)
        //     window.parent.focus()
        //     window.focus() // just in case, older browsers

        //     this.close()
        // }
    }





    useEffect(() => {
        console.log('INIT CalledView')
        // try {

        //     ringerJitsiIn.current.src = '/ringing.mp3'
        //     ringerJitsiIn.current.loop = true
        //   } catch (e) {
        //       console.log(e)
        //   }

        // ringerJitsiIn.current.play();




      }, [])

      useEffect(() => {
        if (infoCall.roomId && infoCall.initUserId) {
            console.log('infoCall', infoCall)
            const value = {
                name: false,
                title: false,
                department: false,
                username: false,
                avatarUrl: false,
                roomName: false
            }
            const result1 = APIClient.v1.get('users.info', { userId: infoCall.initUserId })
            result1.then((resolve) => {
                    value.name = resolve.user.name
                    value.title = resolve.user.title
                    value.department = resolve.user.department
                    value.username = resolve.user.username
                    value.avatarUrl = '/avatar/'+resolve.user.username
            })
            const result2 = APIClient.v1.get('rooms.info', { roomId: infoCall.roomId })
            result2.then((resolve) => {
                if (resolve.room.usersCount>2) {
                    value.roomName = resolve.room.fname

                }

            })
            Promise.all([result1, result2]).then((res) => {
                setInfo(value)
                //viewNotification()

                var body = value.roomName ? value.roomName + '\n' : ''
                body += value.name ? value.name+ '\n' : ''
                body += value.title ? value.title+ '\n' : ''

                const notification = new Notification('Входящий вызов', {
                    requireInteraction: true, //Постоянно отображается
                    icon: value.avatarUrl,
                    body:
                        `${body}`

                    ,
                })
                notification.onclick = function () {
                    window.parent.focus()
                    window.focus() // just in case, older browsers
                    this.close()
                }
                setTimeout(notification.close.bind(notification), timeOutCall);
            });


        }

        try {

                ringerJitsiIn.current.src = '/ringing.mp3'
                ringerJitsiIn.current.loop = true
                ringerJitsiIn.current.play();
            } catch (e) {
                console.log(e)
            }




      }, [])

    return (
        <Fragment>
        <Modal>
            {/* <Modal.Header>
            <Modal.Title>
                {info.roomName ? 'Конференция' : 'Входящий вызов'}

            </Modal.Title>
            </Modal.Header> */}
            <Modal.Content>

                <Box display="flex" flexDirection="column" pbs='x20'>
                    <Box textAlign='center' fontSize="x16" pbe='x20'>
                        {info.roomName ? 'Конференция' : 'Входящий вызов'}
                    </Box>

                    {info.roomName ? (
                        <Fragment>
                            <Box textAlign='center'>
                                <Label pi="x20" fontSize="x18" >
                                    {info.roomName}
                                </Label>

                            </Box>
                            <Box fontStyle='italic' fontSize='x12'>
                                Инициатор:
                            </Box>
                        </Fragment>
                    ):null}


                    <Box display="flex" flexDirection="row" >
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

            </Modal.Content>
            <Modal.Footer>
            <ButtonGroup align='center'>
                <Button onClick={() => handleAnswer()} primary success>Принять</Button>
                <Button onClick={() => handleReject()} primary danger>Отклонить</Button>

            </ButtonGroup>

            </Modal.Footer>
        </Modal>
        <div hidden>
            <audio preload="auto" ref={ringerJitsiIn} />
        </div>

        </Fragment>
    )

}
