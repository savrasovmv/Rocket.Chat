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

    //console.log('CallInView render')

    const [info, setInfo] = useState({
        type: 'Звонок',
        name: false,
        title: false,
        department: false,
        username: false,
        avatarUrl: false,
    })

    const [openNotifi, setOpenNotifi] = useState(false)

    const ringerJitsiIn = createRef() //элемент для рингтона

    const viewNotification = () => {
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
        if (openNotifi) {
            var body = info.name ? info.name+ '\n' : ''
            body += info.title ? info.title+ '\n' : ''

            const notification = new Notification(info.type, {
                requireInteraction: true, //Постоянно отображается
                icon: info.avatarUrl,
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
        }
      }, [openNotifi])

      useEffect(() => {
        if (infoCall.roomId && infoCall.initUserId) {
            //Если участников два, то показываем инфу о юзере иначе о конференции
            if (infoCall.count === 2) {
                const result1 = APIClient.v1.get('users.info', { userId: infoCall.initUserId })
                result1.then((resolve) => {
                    setInfo({
                        type: 'Звонок',
                        name: resolve.user.name,
                        title: resolve.user.title,
                        department: resolve.user.department,
                        username: resolve.user.username,
                        avatarUrl:  '/avatar/'+resolve.user.username,
                    })
                    setOpenNotifi(true)
                })
                result1.catch((reject) => {
                    setOpenNotifi(true)
                })
            } else {
                const result2 = APIClient.v1.get('rooms.info', { roomId: infoCall.roomId })
                result2.then((resolve) => {
                    setInfo({
                        type: 'Конференция',
                        name: resolve.room.fname,
                        title: false,
                        department: false,
                        username: false,
                        avatarUrl:  '/avatar/room/'+resolve.room._id,
                        })
                })
                result2.catch((reject) => {
                    setInfo({
                        type: 'Конференция',
                        name: false,
                        title: false,
                        department: false,
                        username: false,
                        avatarUrl: false,
                        })
                    setOpenNotifi(true)
                })
            }
        }
        try {
                ringerJitsiIn.current.src = '/ringing.mp3'
                ringerJitsiIn.current.loop = true
                ringerJitsiIn.current.play();
            } catch (e) {
                console.log(e)
            }
      }, [])



    useEffect(() => {
        if (infoCall.status === 'waiting') {
            ringerJitsiIn.current.pause();
        }
    }, [infoCall])

    return (
        <Fragment>
            <Modal>
                <Modal.Content>
                    <Box display="flex" flexDirection="column" pbs='x20'>
                        <Box textAlign='center' fontSize="x16" pbe='x20' className={infoCall.status === 'waiting'? 'textmeet-blink' : null}>
                            {info.type} {infoCall.status === 'waiting' ? ' Online': null}
                        </Box>

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
                        <Button onClick={() => handleAnswer()} primary success>{infoCall.status === 'inCall' ? 'Принять' : 'Подключиться'}</Button>
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



