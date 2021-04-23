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


const ringerIn = createRef() //элемент для рингтона

// Вид звонка ВЫЗЫВАЕМОГО
// export const CallInView = ({answerJitsiMeet, rejectJitsiMeet}) => {



//     const handleAnswer= () => {
//         ringerIn.current.pause();
//         answerJitsiMeet()

//     }
//     const handleReject= () => {
//         ringerIn.current.pause();
//         rejectJitsiMeet()
//     }

//     useEffect(() => {
//         console.log('INIT CalledView')

//         try {

//           ringerIn.current.src = '/ringing.mp3'
//           ringerIn.current.loop = true
//         } catch (e) {
//             console.log(e)
//         }
//         ringerIn.current.play();
//       }, [])

//     return (
//         <div>
//             <div>Входящий вызов</div>
//             <button onClick={()=>handleAnswer()}>Принять</button>
//             <button onClick={handleReject}>Отмена</button>
//             <div hidden>
//                 <audio preload="auto" ref={ringerIn} />
//             </div>
//         </div>
//     )

// }


export const CallInView = ({infoCall, handleAnswer, handleReject}) => {
    const [info, setInfo] = useState({
        name: false,
        title: false,
        department: false,
        username: false,
        avatarUrl: false,
        roomName: false
    })



    useEffect(() => {
        console.log('INIT CalledView')

        try {

          ringerIn.current.src = '/ringing.mp3'
          ringerIn.current.loop = true
        } catch (e) {
            console.log(e)
        }
        ringerIn.current.play();
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
            });


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




                    {/* <Box>
                        {info.roomName ? (
                            <Label m="x10" fontSize="x16">
                                Конференция
                            {info.roomName ? info.roomName : null }
                        </Label>
                        ):null}

                    </Box>
                    {info.roomName ? (
                        <Box>Инициатор</Box>
                        ) :null}

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
                    </Box> */}
            </Modal.Content>
            <Modal.Footer>
            <ButtonGroup align='center'>
                <Button onClick={() => handleAnswer()} success>Принять</Button>
                <Button onClick={() => handleReject()} danger>Отклонить</Button>

            </ButtonGroup>

            </Modal.Footer>
        </Modal>
        <div hidden>
            <audio preload="auto" ref={ringerIn} />
        </div>

        </Fragment>
    )

}
