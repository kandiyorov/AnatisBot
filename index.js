process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api')
const config = require('./config.json')
const token = config.Token
const request = require('request')
const bot = new TelegramBot(token, {polling: true})
const moment = require('moment')
const momenttz = require('moment-timezone')
const nodemailer = require('nodemailer')
moment.locale('ru')
momenttz.tz.setDefault('Asia/Yekaterinburg')
const fs = require('fs')
const path = 'C:/Anatis/Clients/'


const kb = {
    a: '\ud83d\udca6 Родниковая Анатис (19л) 10 сомони',
    b: '\ud83d\uddfb Горная вода «Дорогим душанбинцам» (19л) 13 сомони',
    c: '\ud83d\udca7 Биойод Анатис (19л) 15 сомони'
}//номенклатура воды

const kl = {
    l2: '1',
    l3: '2',
    l4: '3',
    l5: '4',
    l6: '5',
    l7: '7',
    l8: '10',
    l9: 'более 10',
} // количество


const time = {
    t7: 'c 8:00 до 13:00',
    t10: 'c 13:00 до 18:00'
}

const v2 = {
    vt1: '',
    vt2: ''
}//сегодня, завтра */

const formatdate = {
    month: 'narrow',
    day: 'numeric',
    year: 'numeric'
}

const zakaz = ''
const voda = ''
const tm = ''
const day = ''

bot.onText(/\/start/, function (msg, match) {
    const start = {
        parse_mode: 'markdown',
    }
    bot.sendMessage(msg.chat.id, `Здравствуйте, ${msg.from.first_name}. Я помогу Вам заказать бутилированную воду в 19 литровой таре в г. *Душанбе*` , start)
    sendcontact(msg)
})//start

bot.on('polling_error', (error) => {
    console.log('Ошибка Polling: '+error);  // => 'EFATAL'
})


function writenum(msg) {
    fs.writeFile(path+msg.from.id, msg.contact.first_name+'\n'+msg.contact.phone_number.replace('+', ''), (err) => {
        if (err) {
            console.error('ошибка при записи файла'+err)
            return
        }
        //файл записан успешно
    })
}

function Append(msg) {

    fs.appendFile(path+msg.from.id, `\n${msg.text}`, (err) => {
        if (err) throw err;
    console.log('Адрес добавлен');
})
}

function checkingID(msg) {
    const TG = {
        name: '',
        phone: '',
        address: ''
    }
    fs.access(path+msg.from.id, fs.F_OK, (err) => {
        if (err) {
            writenum(msg)
            console.log('nomera net')
            TG.phone = msg.contact.phone_number.replace('+', '')
            TG.name = msg.contact.first_name
//    const x = `customer`
//    const y = `number`
            bot.sendMessage(msg.chat.id, TG.name + ', Ваш номер: ' + TG.phone)
            bot.sendMessage(msg.chat.id, 'Напишите полный адрес доставки (улица, дом, квартира/офис)')
            return
        }//Номера нет в БД, запись файла

//--------------------вывод адреса из файла
        fs.readFile(path+msg.from.id, function (err, data) {
            if (err) {
                console.log('Номера нет')
                sendcontact(msg)
            } else {
                var array = data.toString().split("\n")
                TG.name = array[0]
                TG.phone = array[1]
                TG.address = array[2]
                switch (TG.address) {
                    case undefined: {
                        bot.sendMessage(msg.chat.id, 'Напишите пожалуйста Ваш полный адрес доставки в формате - улица, дом, подъезд, квартира/офис')
                        break
                    }
                    default: {
                        bot.sendMessage(msg.chat.id, TG.name + ', Ваш адрес: ' + TG.address + '. Если это некорректный адрес введите еще раз')
                        vvoda(msg)
                    }
                }
            }
        })
//-------------------

})} //Поиск файла в директории


/*
function checkBD(msg) {
    const TG = {
        name: '',
        phone: '',
        address: ''
    }
    TG.phone = msg.contact.phone_number.replace('+', '')
    TG.name = msg.contact.first_name
    const x = `customer`
    const y = `number`
    bot.sendMessage(msg.chat.id, TG.name + ', Ваш номер: ' + TG.phone)
    const options = {
        uri: config.uri,
        contentType: 'application/json',
        method: 'POST',
        json: {
            'Method':'_get_number_client', 'Data':[{'www_ident':config.ident,'www_number':TG.phone}]
        }
    }

    request(options, function (error, response, body) {
        if (error) {
            console.log('Ошибка: '+error)
        }

        else {
            var js = JSON.parse(JSON.stringify(body))
//        console.log(getValues(js,'Адрес'))
            const tempaddr = getValues(js,'Адрес')
//        console.log(tempaddr)
            if (tempaddr.length === 0) {
//                bot.sendMessage(msg.chat.id, 'Похоже вы в первый раз заказываете воду. Напишите полный адрес доставки (улица, дом, квартира/офис)')
                checkingID(msg)
            } else {
                TG.address = String(tempaddr)
                bot.sendMessage(msg.chat.id, 'Ваш адрес: '+TG.address.substr(0,15)+'...............')
                fs.access(path+msg.from.id, fs.F_OK, (err) => {
                    if (err) {
                        fs.writeFile(path+msg.from.id, TG.name+'\n'+TG.phone+'\n'+TG.address, (err) => {
                            if (err) {
                                console.error('ошибка при записи файла'+err)
                                return
                            }
                            //файл записан успешно
                        })
                        return
                    }//Номера нет в БД, запись файла
                })
                vvoda(msg)
            }
        }
    })

}
*///проверка в базе данных


function sendday(msg) {
    bot.sendMessage(msg.chat.id, 'Выберете день доставки:', {
        reply_markup: {
            one_time_keyboard: true,
            keyboard: [
                [v2.vt1],
                [v2.vt2]
            ]}
    })

}

bot.on('contact', function (msg) {
//    checkBD (msg)
    checkingID (msg)
})

function Sendmail (msg){
    const TG = {
        name: '',
        phone: '',
        address: ''
    }

    fs.access(path+msg.from.id, fs.F_OK, (err) => {
        if (err) {
            sendcontact(msg)
            return
        }

//------------выгрузка данных из файла
    fs.readFile(path+msg.from.id, function(err, data) {
        if(err) throw err;
        var array = data.toString().split("\n")
        TG.name = array[0]
        TG.phone = array[1]
        TG.address = array[2]
        console.log(TG.name)
        console.log(TG.phone)
        console.log(TG.address)


        nodemailer.createTestAccount((err, account) => {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: config.user, // generated ethereal user
                    pass: config.pass // generated ethereal password
                }
            })
            var mailOptions = {
                from: config.from, // sender address
                to: config.to, // list of receivers
                bcc: config.bcc,
                cc: config.cc,
                subject: config.subject, // Subject line
                text: TG.name+' заказал воду '+global.zakaz+' в количестве '+global.voda+'шт., по адресу: '+TG.address+', день доставки: '+global.day+', время доставки: '+global.tm+', номер телефона: '+TG.phone, // plain text body
            }
            transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    })

    })



    })


//------------
        bot.sendMessage(msg.chat.id, 'Ваша заявка принята, благодарим Вас за покупку \ud83d\udc4d, наш менеджер свяжеться с Вами в рабочие часы с 9:00 до 18:00 кроме воскресенья по указанному телефону для уточнения деталей заказа', {
            reply_markup: {
                one_time_keyboard: true,
                keyboard: [
                    ['/start'],
                    ['/info']
                ]}
        })


})
}//отправка заказа по почте

function vakt (msg) {
    bot.sendMessage(msg.chat.id, 'Выберете время доставки воды:', {
        reply_markup: {
            one_time_keyboard: true,
            keyboard: [
                [time.t7],
                [time.t10]
            ]}
    })
}//выбор времени доставки

function vakt2 (msg) {
    const Ruz = momenttz (new Date()).add(0,'days').format('dddd')
    const t = momenttz (new Date()).format('LTS')
    console.log(t)
    console.log(Ruz)
//    console.log(global.date)
    if (Ruz == 'четверг') {
        if (t >= '18:00:00'){
            v2.vt1 =  momenttz (new Date()).add(2,'days').format('LL')
            v2.vt2 =  momenttz (new Date()).add(4,'days').format('LL')
            sendday(msg)

        }else {
            v2.vt1 =  momenttz (new Date()).add(1,'days').format('LL')
            v2.vt2 =  momenttz (new Date()).add(2,'days').format('LL')
            sendday(msg)
        }
    }
    else if (Ruz == 'пятница') {
        if (t >= '18:00:00'){
            v2.vt1 =  momenttz (new Date()).add(3,'days').format('LL')
            v2.vt2 =  momenttz (new Date()).add(4,'days').format('LL')
            sendday(msg)

        }else {
            v2.vt1 =  momenttz (new Date()).add(1,'days').format('LL')
            v2.vt2 =  momenttz (new Date()).add(3,'days').format('LL')
            sendday(msg)
        }
    }
    else if (Ruz == 'суббота') {
        v2.vt1 =  momenttz (new Date()).add(2,'days').format('LL')
        v2.vt2 =  momenttz (new Date()).add(3,'days').format('LL')
        bot.sendMessage(msg.chat.id, 'Выберете день доставки:', {
            reply_markup: {
                one_time_keyboard: true,
                keyboard: [
                    [v2.vt1],
                    [v2.vt2]
                ]}
        })
    }
    else {
        if (t >= '18:00:00'){
            v2.vt1 =  momenttz (new Date()).add(2,'days').format('LL')
            v2.vt2 =  momenttz (new Date()).add(3,'days').format('LL')
            sendday(msg)

        }else {
            v2.vt1 =  momenttz (new Date()).add(1,'days').format('LL')
            v2.vt2 =  momenttz (new Date()).add(2,'days').format('LL')
            sendday(msg)
        }
    }
}//день доставки

function sendcontact (msg){
    const option = {
        "parse_mode": "Markdown",
        "reply_markup": {
            "one_time_keyboard": true,
            "keyboard": [[{
                text: "Отправить мой номер",
                request_contact: true
            }], ["Отмена"]]
        }
    }
    bot.sendMessage(msg.chat.id, `Отправьте Ваш номер телефона  \ud83d\udcde`, option).then(() => {

    })
}//отправка телефона

function kol(msg) {
    bot.sendMessage(msg.chat.id, 'Выберете необходимое количество:', {
        reply_markup: {
            one_time_keyboard: true,
            keyboard: [
                [kl.l2],
                [kl.l3],
                [kl.l4],
                [kl.l5],
                [kl.l6],
                [kl.l7],
                [kl.l8],
                [kl.l9]
            ]}
    })
}//выбор количества

function vvoda(msg){
    bot.sendMessage(msg.chat.id, 'Выберите воду в 19л таре для заказа:', {
        reply_markup: {
            one_time_keyboard: true,
            keyboard: [
                [kb.a],
                [kb.b],
                [kb.c]
            ]}
    })
}//выбор номенклатуры воды

function getValues(obj, key) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getValues(obj[i], key));
        } else if (i == key) {
            objects.push(obj[i]);
        }
    }
    return objects;
}//обработка(парсинг) JSON ответа

function checkAD(msg){
    const tmpAD = msg.text
    const TG = {
        name: '',
        phone: '',
        address: ''
    }
    fs.access(path+msg.from.id, fs.F_OK, (err) => {
        if (err) {
//            console.error(err)
            console.log('Not ok')
            sendcontact(msg)
            return
        }
        console.log('Ok')
//------------выгрузка данных из файла
    fs.readFile(path+msg.from.id, function(err, data) {
        if(err) throw err;
        var array = data.toString().split("\n")
        TG.name = array[0]
        TG.phone = array[1]
        TG.address = array[2]
        switch (TG.address){
            case undefined:{
                Append(msg)
                bot.sendMessage(msg.chat.id, 'Ваш адрес: '+msg.text+'. Если это некорректный адрес введите еще раз')
                vvoda(msg)
                break
            }
            default:{
                const result = data.toString().replace(new RegExp(TG.address), tmpAD)
                fs.writeFile(path+msg.from.id, result, function (err) {
                    if (err){ console.log(err)}
                })
                console.log('Адрес Обновлен !')
                bot.sendMessage(msg.chat.id, 'Ваш адрес: '+tmpAD+'. Если это некорректный адрес введите еще раз')
                vvoda(msg)
                break
            }

        }

    })


//------------
//        bot.sendMessage(msg.chat.id, 'Ваш адрес: '+TG.address+'. Если это некорректный адрес введите еще раз')
//        vvoda(msg)

})
}//Обработка входящих сообщений


bot.on('message', msg => {
//   console.log(msg.text)
    switch (msg.text){
case '/start':{
//    bot.sendMessage(msg.chat.id, `Здравствуйте, ${msg.from.first_name}. Я помогу Вам заказать бутилированную воду в 19 литровой таре в **Москве**?`, parse_mode='HTML')
//    sendcontact(msg)
        break}

case '/info':
    break
case undefined:
        break
case 'Отмена':
    break
case kb.a:{
        global.zakaz =  kb.a
        kol(msg)
        break}
case kb.b:{
        global.zakaz =  kb.b
        kol(msg)
        break}
case kb.c:{
        global.zakaz =  kb.c
        kol(msg)
        break}
case kl.l2:{
        global.voda =  kl.l2
        vakt2 (msg)
        break}
case kl.l3:{
        global.voda = kl.l3
        vakt2 (msg)
        break}
case kl.l4:{
        global.voda = kl.l4
        vakt2 (msg)
        break}
case kl.l5:{
        global.voda = kl.l5
        vakt2 (msg)
        break}
case kl.l6:{
        global.voda = kl.l6
        vakt2 (msg)
        break}
case kl.l7:{
        global.voda = kl.l7
        vakt2 (msg)
        break}
case kl.l8:{
        global.voda = kl.l8
        vakt2 (msg)
        break}
case kl.l9:{
        global.voda = kl.l9
        vakt2 (msg)
        break}
case time.t7:{
        global.tm =  time.t7
        Sendmail(msg)
        break}
case time.t10:{
        global.tm =  time.t10
        Sendmail(msg)
        break}
case v2.vt1:{
        global.day = v2.vt1
        vakt(msg)
        break}
case v2.vt2:{
        global.day = v2.vt2
        vakt(msg)
        break}
default:{
        checkAD(msg)
        break}
}
})//прослушка входящих сообщений


bot.onText(/\/info/, (msg) => {
    bot.sendMessage(msg.chat.id, `ANATIS компания по доставке питьевой бутилированной воды для дома и офиса.\n  С нами вам достаточно выбрать необходимый товар, заказать его в один клик и мы доставим его Вам в удобное время.`)
})
