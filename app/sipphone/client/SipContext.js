import React, { useContext, useState } from 'react'
const SipContext = React.createContext()
export const useSip = () => {
	return useContext(SipContext)
}

export const SipProvider = ({ children }) => {
	const [statusPhone, setStatusPhone] = useState('offline')

	const handleStatus = (newstatus) => {
		console.log('NEW STATUS', newstatus)
		setStatusPhone(newstatus)
		console.log('NEW STATUS PHONE', statusPhone)
	}
	console.log('STATUS', statusPhone)

	return (
		<SipContext.Provider
			value={{
				statusPhone,
				handleStatus,
				setStatusPhone,
			}}
		>
			{children}
		</SipContext.Provider>
	)
}
