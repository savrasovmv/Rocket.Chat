import React, { useState } from 'react'
import PropTypes from 'prop-types'

const InfoBlock = ({ displayCall, duration }) => {
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
						{duration}
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

export const SwipeCaruselBlock = ({
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
		// console.log("activeChannelNumber");
		// console.log(activeChannelNumber);

		newValue = event.currentTarget.value
		// console.log("newValue");
		// console.log(newValue);
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
				{displayCalls.map((displayCall, key) => (
					<div
						key={`${displayCall.id}-TabPanel`}
						value={key}
						index={displayCall.id}
					>
						<button
							key={`${displayCall.id}`}
							value={key}
							index={displayCall.id}
							onClick={handleTabChange}
							className="panel-button panel-button-min"
							style={{
								color: displayCall.inCall === true ? 'red' : 'green',
							}}
						>
							<p>Линия № {displayCall.id + 1}</p>
						</button>

						<div> Линия № {displayCall.id + 1}</div>

						<InfoBlock
							displayCall={displayCall}
							duration={duration[key].duration}
						/>
					</div>
				))}
			</div>
		</div>
	)
}

SwipeCaruselBlock.propTypes = {
	localStatePhone: PropTypes.any,
	activeChannelNumber: PropTypes.any,
	setActiveChannel: PropTypes.any,
}
export default SwipeCaruselBlock
