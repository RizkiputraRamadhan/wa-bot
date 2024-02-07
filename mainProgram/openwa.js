const qrcode = require('qrcode-terminal');
const fs = require("fs")
const { Client, LegacySessionAuth, LocalAuth, MessageMedia} = require('whatsapp-web.js');
const { getSystemErrorMap } = require('util');
const { OpenAI, OpenAIApi } = require("openai");
const { url } = require('inspector');
const openai = new OpenAI({
    apiKey: "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" // This is also the default, can be omitted
});
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "client-one" //Un identificador(Sugiero que no lo modifiques)
    })
})


// Save session values to the file upon successful auth
client.on('authenticated', (session) => {
    console.log(session);
});
 

client.initialize();
client.on("qr", qr => {
    qrcode.generate(qr, {small: true} );
})

client.on('ready', () => {
    console.log("ready to message")
});

function man(){
    client.on('message_create', async (message) => { 
        console.log(message)
        message.reply(`${message.body}!`)
    });
    client.on('message', async message => {
        if (message.body.startsWith('/ask')) {
            let text = message.body.slice(5); // Memotong '/ask' dari awal pesan
            var qst = `Q: ${text}\nA:`;
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: qst,
                temperature: 0,
                max_tokens: 300,
                top_p: 1.0,
                frequency_penalty: 0.0,
                presence_penalty: 0.0,
            });
            message.reply(response.data.choices[0].text);
        } else if (message.body.startsWith('/draw')) {
            let text = message.body.split('/draw')[1];
            var qst = `Q: ${text}\nA:`;
            const response = await openai.createImage({
                prompt: text,
                n: 1,
                size: '512x512'
            });
            var imgUrl = response.data.data[0].url;
            const media = await MessageMedia.fromUrl(imgUrl);
            await client.sendMessage(message.from, media, {caption: "your image"})
        }
    });
    
}

man();
