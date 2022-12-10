import {io} from 'socket.io-client'

const socket = io(HYPEGIENIC_API, {
  transports: ['websocket'],
  autoConnect: false
})
export default socket