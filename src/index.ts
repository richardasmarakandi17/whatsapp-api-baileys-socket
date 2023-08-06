import express from 'express'
import fs from 'fs'
import connectToWhatsApp from './functions/connectToWhatsapp'
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'
const app = express()

app.listen(3001, () => {
    console.log("App starts...")
})

const socks: {
    [phone_number: string]: ReturnType<typeof makeWASocket>
} = {}

fs.readdir('sessions', async (error, sessions) => {
    if (error) console.log(error)
    for (let session of sessions) {
        socks[session] = await connectToWhatsApp(session) as any
    }
}) 
app.get('/login/:device', async (req, res) => {
    if (!socks[req.params.device]) socks[req.params.device] = (await connectToWhatsApp(req.params.device)) as any
    res.status(200).json({success: true, message: 'Socket created.'})
})

app.get('/send_message/:device', async (req, res) => {
    try {
        await socks[req.params.device].sendMessage('6287714041231@s.whatsapp.net', {text: 'Something'})
    } catch (error) {
        console.log(error)
    }
})