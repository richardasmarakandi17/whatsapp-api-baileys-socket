import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'

export default async function connectToWhatsApp (phone_number: string) {
    let readySock = await new Promise(async (resolve, reject) => {
        const {state, saveCreds} = await useMultiFileAuthState(`sessions/${phone_number}`)
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: true
        })
        sock.ev.on('creds.update', saveCreds)
        sock.ev.on('connection.update',async (update) => {
            console.log('=================Connection Update===================')
            const { connection, lastDisconnect } = update
            if(connection === 'close') {
                console.log('=================Connection Close===================')
                await connectToWhatsApp(phone_number).then(sock => (resolve(sock)))
            } else if(connection === 'open') {
                console.log('=================Connection Open===================')
                return resolve(sock)
            }
        })
        sock.ev.on('messages.upsert', async m => {
            console.log(JSON.stringify(m, undefined, 2))
        })
    })
    return readySock
}