import React, { useEffect } from 'react'
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
  Fragment,
  ButtonGroup
} from '@rocket.chat/fuselage'

// const call_icon = "/icons/call-icon.svg"
// const end_icon = "/icons/end2-icon.svg"

export const CallQueue = ({ calls, favorites, handleAnswer, handleReject, getDisplayName }) => {
  console.log("render CallQueue")
  console.log("calls", calls)
  useEffect(() => {
    console.log("useEffect CallQueue")

    calls.map((call) => {
      if (!call.isUpdateName) {
        getDisplayName(call.callNumber, call.displayName, true)
      }
    })


  },[calls])


  return (
    <div>
      {calls.map((call) => (
        // const parsedCaller = call.callNumber.split('-')
        // return (
          <Modal key={call.sessionId}>
              <Modal.Content>
                  <Box display="flex" flexDirection="column" pbs='x20'>
                      <Box textAlign='center' fontSize="x16" pbe='x20' >
                          Входящий вызов
                      </Box>

                      <Label>
                        {call.favoritesName ? call.favoritesName : call.displayName }
                      </Label>
                      <Label>
                        {call.callNumber}
                      </Label>
                  </Box>
              </Modal.Content>
              <Modal.Footer>
                  <ButtonGroup align='center'>
                      <Button onClick={() => handleAnswer(call.sessionId)} primary success>Принять</Button>
                      <Button onClick={() => handleReject(call.sessionId)} primary danger>Отклонить</Button>
                  </ButtonGroup>
              </Modal.Footer>
          </Modal>

        // )
      ))}

    </div>
  )
}

export default CallQueue



// export const CallQueue = ({ calls, favorites, handleAnswer, handleReject }) => {
//   console.log("calls", calls)
//   // useEffect(() => {
//   //   res = favorites.filter(el => el.number===calls.nu)

//   // },[])
//   return (
//     <div>
//       {calls.map((call) => {
//         const parsedCaller = call.callNumber.split('-')
//         return (
//           <Modal key={call.sessionId}>
//               <Modal.Content>
//                   <Box display="flex" flexDirection="column" pbs='x20'>
//                       <Box textAlign='center' fontSize="x16" pbe='x20' >
//                           Входящий вызов
//                       </Box>

//                       <Label>
//                       {call.callNumber} - {favorites.filter(el => el.number===call.callNumber).displayName ? favorites.filter(el => el.number===call.callNumber).displayName : call.displayName }
//                       </Label>
//                   </Box>
//               </Modal.Content>
//               <Modal.Footer>
//                   <ButtonGroup align='center'>
//                       <Button onClick={() => handleAnswer(call.sessionId)} primary success>Принять</Button>
//                       <Button onClick={() => handleReject(call.sessionId)} primary danger>Отклонить</Button>
//                   </ButtonGroup>
//               </Modal.Footer>
//           </Modal>

//         )
//       })}

//     </div>
//   )
// }

{/* <Box
      display="flex"
      justifyContent="center"
      // position="absolute"
      // zIndex="99"
      // invisible={false}
    >
      {calls.map((call) => {
        const parsedCaller = call.callNumber.split('-')
        return (
          <Box key={call.sessionId}>
            <Box>
              <dfn>Входящий вызов</dfn>
            </Box>
            <Label>
              {parsedCaller[0] ? parsedCaller[0] : null}
              {parsedCaller[1] ? parsedCaller[1] : null}
              {parsedCaller[2] ? parsedCaller[2] : null}
            </Label>
            <Button
              minWidth="x100"
              mi="x5"
              primary
              success
              onClick={() => handleAnswer(call.sessionId)}
            >
              <Icon name="phone" size="x20" />
            </Button>
            <Button
              mi="5"
              minWidth="x100"
              primary
              danger
              onClick={() => handleReject(call.sessionId)}
            >
              <Icon name="phone-off" size="x20" />
            </Button>
          </Box>
        )
      })}
    </Box> */}
