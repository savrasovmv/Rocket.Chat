import React, { useState } from 'react'
import PropTypes from 'prop-types'

const LineInfoBlock = ({ displayCall, duration }) => {
  const secondsToHms = (d) => {
    d = Number(d)
    var h = Math.floor(d / 3600)
    var m = Math.floor((d % 3600) / 60)
    var s = Math.floor((d % 3600) % 60)

    var hDisplay = h
    var mDisplay = m < 10 ? '0' + m : m
    var sDisplay = s < 10 ? '0' + s : s
    return hDisplay + ':' + mDisplay + ':' + sDisplay
  }

  if (displayCall.inCall === true) {
    if (displayCall.inAnswer === true) {
      if (displayCall.hold === true) {
        // Show hold Call info
        return (
          <div>
            <div>На удержании Статус: {displayCall.callInfo}</div>
            <div>
              Длительность:
              {duration}
            </div>
            <div>
              Номер:
              {displayCall.callNumber}
            </div>
            <div>
              Направление:
              {displayCall.direction}
            </div>
          </div>
        )
      }

      if (displayCall.inTransfer === true) {
        // Show In Transfer info
        return (
          <div>
            <div>Статус: {displayCall.callInfo}</div>
            <div>
              Side:
              {displayCall.direction}
            </div>
            <div>
              Длительность:
              {duration}
            </div>
            <div>Номер: {displayCall.callNumber}</div>
            <div>Transfer to : {displayCall.transferNumber}</div>
            <div>
              {displayCall.attendedTransferOnline.length > 1 &&
              !displayCall.inConference ? (
                <span>
                  {'Talking with :'} {displayCall.attendedTransferOnline}
                </span>
              ) : null}
            </div>
          </div>
        )
      }

      return (
        <div>
          <div>
            Статус:
            {displayCall.callInfo}
          </div>
          <div>
            Направление:
            {displayCall.direction}
          </div>
          <div>
            Длительность:
            {secondsToHms(duration)}
          </div>
          <div>
            Номер:
            {displayCall.callNumber}
          </div>
        </div>
      )
    }

    return (
      <div>
        <div>
          Статус:
          {displayCall.callInfo}
        </div>
        <div>
          Направление:
          {displayCall.direction}
        </div>
        <div>
          Номер:
          {displayCall.callNumber}
        </div>
      </div>
    )
  }
  return <div></div>
}

export const InfoBlock = ({
  displayCall,
  localStatePhone,
  activeChannelNumber,
  setActiveChannel,
}) => {
  const [duration, setDuration] = useState([
    {
      duration: 0,
    },
    {
      duration: 0,
    },
    {
      duration: 0,
    },
  ])
  const [intervals, setintervals] = useState([
    {
      intrId: 0,
      active: false,
    },
    {
      intrId: 0,
      active: false,
    },
    {
      intrId: 0,
      active: false,
    },
  ])
  const { displayCalls } = localStatePhone
  const handleTabChangeIndex = (index) => {
    setActiveChannel(index)
  }
  const handleTabChange = (event, newValue) => {
    console.log('activeChannelNumber')
    console.log(activeChannelNumber)

    newValue = event.currentTarget.value
    console.log('newValue')
    console.log(newValue)
    setActiveChannel(newValue)
  }

  displayCalls.map((displayCall, key) => {
    // if Call just started then increment duration every one second
    if (
      displayCall.inCall === true &&
      displayCall.inAnswer === true &&
      intervals[key].active === false
    ) {
      const intr = setInterval(() => {
        setDuration((durations) => ({
          ...durations,
          [key]: { duration: durations[key].duration + 1 },
        }))
      }, 1000)

      setintervals((inter) => ({
        ...inter,
        [key]: { intrId: intr, active: true },
      }))
    }
    // if Call ended  then stop  increment duration every one second
    if (
      displayCall.inCall === false &&
      displayCall.inAnswer === false &&
      intervals[key].active === true
    ) {
      clearInterval(intervals[key].intrId)
      setDuration((durations) => ({ ...durations, [key]: { duration: 0 } }))
      setintervals((inter) => ({
        ...inter,
        [key]: { intrId: 0, active: false },
      }))
    }
    return true
  })

  return (
    <div>
      <div className="flex-container info-block">
        <LineInfoBlock
          displayCall={displayCall}
          duration={duration[displayCall.id].duration}
        />
      </div>
    </div>
  )
}

InfoBlock.propTypes = {
  localStatePhone: PropTypes.any,
  activeChannelNumber: PropTypes.any,
  setActiveChannel: PropTypes.any,
}
export default InfoBlock
