import React, { useContext, useState } from 'react'
import { validateRequestWithBody } from 'twilio'
const SipContext = React.createContext({
	config: false,
	setConfig: () => undefined,
	statusPhone: {},
	setStatusPhone: () => undefined,
	isTransfer: {},
	setIsTransfer: () => undefined,
	transferNumber: {},
	setTransferNumber: () => undefined,
	ipPhone: {},
	setIpPhone: () => undefined,


})

export default SipContext

export const useSipContext = () => {
	return useContext(SipContext)
}

export const SipProvider = ({ children }) => {

	const [config, setConfig] = useState(false)
  	const [ipPhone, setIpPhone] = useState(false)

	const [statusPhone, setStatusPhone] = useState('offline')

	const [isTransfer, setIsTransfer] = useState(false)
	const [transferNumber, setTransferNumber] = useState('')

	const handleStatus = (newstatus) => {
		console.log('NEW STATUS', newstatus)
		setStatusPhone(newstatus)
		console.log('NEW STATUS PHONE', statusPhone)
	}

	const value = {
					statusPhone,
					isTransfer,
					setIsTransfer,
					transferNumber,
					setTransferNumber,
					handleStatus,
					setStatusPhone,
					config,
					setConfig,
					ipPhone,
					setIpPhone

				};


	console.log('STATUS', statusPhone)

	return (
		<SipContext.Provider
			value={value}
		>
			{children}
		</SipContext.Provider>
	)
}


// return (
// 	<SipContext.Provider
// 		value={{
// 			statusPhone,
// 			handleStatus,
// 			setStatusPhone,
// 		}}
// 	>
// 		{children}
// 	</SipContext.Provider>
// )
// }

