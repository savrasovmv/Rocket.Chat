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
import { getRoomInfo } from '../lib/getInfoRoom'
import { APIClient } from '../../utils/client'




const ringer = createRef() //элемент для рингтона

// Вид звонка ЗВОНЯЩЕГО
// export const CallOutView = () => {


//     const handleReject= () => {
//         ringer.current.pause();
//     }

//     useEffect(() => {
//         console.log('INIT CallerView')

//         try {

//           ringer.current.src = '/callerRington.mp3'
//           ringer.current.loop = true
//         } catch (e) {
//             console.log(e)
//         }
//         ringer.current.play();
//       }, [])

//     return (
//         <div>
//             <div>Вызываю</div>
//             <button onClick={handleReject}>Отмена</button>
//             <div hidden>
//                 <audio preload="auto" ref={ringer} />
//             </div>
//         </div>
//     )

// }

export const CallOutView = ({status, membersStatus, infoCall, handleCancel}) => {

    const [avatarUrl, setAvatarUrl] = useState(false)
    const [info, setInfo] = useState(false)
    // const handleReject= () => {
    //     ringer.current.pause();
    // }

    useEffect(() => {
        console.log('INIT CallerView')

        try {

          ringer.current.src = '/callerRington.mp3'
          ringer.current.loop = true
        } catch (e) {
            console.log(e)
        }
        ringer.current.play();
      }, [])

    useEffect(() => {
        if (infoCall.roomId) {
            console.log('infoCall', infoCall)
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

    }, [])




    return (
        <Fragment>
            <Modal>
                <Modal.Header>
                <Modal.Title>Исходящий вызов</Modal.Title>
                </Modal.Header>
                <Modal.Content>
                    <Box>
                        {info.avatarUrl ? (
                            <Avatar url={info.avatarUrl} size='x48' />
                        ):null}
                        <Label m="x10" fontSize="x16">
                            {info.name ? info.name : null }
                        </Label>
                    </Box>
                    <Box>
                        {info.title ? info.title : null }
                    </Box>
                    <Box>
                        {info.department ? info.department : null }
                    </Box>
                    {membersStatus.map((me) => {
                        <Box key={me.userId}>
                            {me.userId} - {me.status}
                        </Box>
                    })}


                </Modal.Content>
                <Modal.Footer>
                    {status === 'reject' ? (
                        <Box color='danger'>
                            Пользователь отклонил вызов
                        </Box>

                    ): (
                        <ButtonGroup align='end'>
                            <Button onClick={() => handleCancel()}>Отменить</Button>
                        </ButtonGroup>
                    )}

                </Modal.Footer>
            </Modal>
            <div hidden>
            <audio preload="auto" ref={ringer} />
        </div>
        </Fragment>
    )

}
