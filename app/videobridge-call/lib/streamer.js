import { Meteor } from 'meteor/meteor'
export const streamerJitsiCall = new Meteor.Streamer('jitsiCall')


export const sendJitsiCallToServer = (userId, roomId, jitsiUrl) => {
	console.log("------------------- sendJitsiCallToServer-----------------")
	console.log("------userId", userId)
	console.log("------roomId", roomId)
	console.log("------jitsiUrl", jitsiUrl)
	console.log("--------------------------------------------------")

	const steamName = 'sendJitsiCallToServer'
	const value = {
		jitsiUrl: jitsiUrl,
		userId: userId ? userId : Meteor.userId(),
		roomId: roomId,
	}
	streamerJitsiCall.emit(steamName, value)

}



export const streamJitsiCall = (setFunc) => {
	const steamName = Meteor.userId() + '/JitsiCall'
	streamerJitsiCall.on(steamName, function (value) {
		console.log('JitsiCall Server: ' + value)
		setFunc(value)
	})
}


// if (Meteor.isServer) {
// 	streamerJitsiCall.allowRead('logged')
// 	streamerJitsiCall.allowWrite('logged')
// }
