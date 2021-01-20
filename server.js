const express = require('express')
const app = express()
const swaggerUi = require('swagger-ui-express')
const airports = require('./airports.json')
const YAML = require('js-yaml')
const fs = require('fs')
const docs = YAML.load(fs.readFileSync('./airports-config.yaml').toString())
const swaggerDocs = require('swagger-jsdoc')({
    swaggerDefinition: docs,
    apis: ['./server.js', './Airport.js']
})


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {explorer: true}),express.json())

app.get('/airports', (req,res) => {
    var pagesize
    if (req.query.page){
        if(req.query.pageSize){
            pageSize = req.query.pageSize
        }
        else{
            pageSize = 100
        }
        const pageNo = req.query.page
        console.log(pageNo)
        const airportsSlice = airports.slice(pageNo*pageSize-pageSize,pageNo*pageSize)
        res.status(200).send(airportsSlice)
        return
    }
    res.status(200).send(airports)
})

app.post('/airports', express.json(), (req,res) => {
    //
    //---------is JSON? if not 415-------
    //
    console.log(Object.keys(req.body))

    if (Object.keys(req.body).length == 0){
        console.log('415')
        res.status(415).send({})
        return
    }
    const bodyKeys = Object.keys(req.body)
    const airportKeys = ["icao","iata","name","city","state","country","elevation","lat","lon","tz"]
    const requiredAirportKeys = ["icao","city","name"]
    const bodyKeysInAirport = bodyKeys.every(val => airportKeys.includes(val))
    const includesRequiredKeys = requiredAirportKeys.every(val => bodyKeys.includes(val))
    const icaoAlreadyExists = airports.every(val=> val["icao"] !== req.body["icao"])
    if (!bodyKeysInAirport || !includesRequiredKeys || !icaoAlreadyExists){
        console.log("400")
        res.status(400).send({})
        return
    }
    const airport = {}
    airportKeys.forEach( (key) => {
        req.body[key] ? airport[key] = req.body[key] : airport[key] = ""
    })
    airports.push(airport)
    console.log("201")
    res.status(201).send({})
    console.log(airports[airports.length -1 ])
})

app.get('/airports/:icao',(req,res) =>{
    const airport = airports.filter(obj => {
        return obj.icao == req.params.icao
      })[0]
    if (airport){
        console.log('200')
        res.status(200).send(airport)
    }
    else{
        console.log("404")
        res.status(404).send({})
    }
})

app.put('/airports/:icao',express.json(), (req,res) => {
    const airport = airports.filter(obj => {
        return obj.icao == req.params.icao
      })[0]
    if (!airport){
        res.status(404).send({})
        return
    }
    if (Object.keys(req.body).length == 0){
        console.log('415')
        res.status(415).send({})
        return
    }
    const bodyKeys = Object.keys(req.body)
    console.log(bodyKeys)
    const airportKeys = ["icao","iata","name","city","state","country","elevation","lat","lon","tz"]
    const bodyKeysInAirport = bodyKeys.every(val => airportKeys.includes(val))
    if (!bodyKeysInAirport){
        console.log(400)
        res.status(400).send({})
        return
    }
    if (airport["icao"] != req.body["icao"]){
        console.log(400)
        res.status(400).send({})
        return
    }
    const putAirport = {"icao":req.params.icao}
    airportKeys.forEach( (key) => {
        req.body[key] ? putAirport[key] = req.body[key] : putAirport[key] = ""
    })
    const airportIndex = airports.indexOf(airport)
    airports[airportIndex]=putAirport
    res.status(200).send({})
})

app.patch('/airports/:icao', express.json(), (req,res) => {
    //
    //---------is JSON? if not 415-------
    //
    console.log(req.body)
    console.log(typeof req.body)
    if (Object.keys(req.body).length == 0){
        console.log('415')
        res.status(415).send({})
        return
    }
    const airport = airports.filter(obj => {
        return obj.icao == req.params.icao
      })[0]
    //
    //--------is not found?-------
    //
    if (!airport){
        console.log("404")
        res.status(404).send({})
    }
    else{
        const bodyKeys = Object.keys(req.body)
        const airportKeys = Object.keys(airport)
        const bodyKeysInAirport = bodyKeys.every(val => airportKeys.includes(val))
        //
        //---------are keys correct?---------
        //
        if (!bodyKeysInAirport){
            console.log("400")
            res.status(400).send({})
        }
        else{
            //
            //---------do the thing----------------
            //
            Object.keys(airport).forEach((key) => {
                if(req.body[key]){
                    console.log("doing the thing")
                    airport[key] = req.body[key]
                }
            })
            console.log(airport)
            airports[req.params.icao]=airport
            res.status(200).send({})
        }
    }
})


app.delete('/airports/:icao', (req,res) => {
    const airport = airports.filter(obj => {
        return obj.icao == req.params.icao
      })[0]
    if (!airport){
        console.log('404')
        res.status(404).send({})
        return
    }
    console.log(airport)
    const airportIndex = airports.indexOf(airport)
    console.log(airportIndex)
    airports.splice(airportIndex,1)
    res.status(204).send({})
})

//app.listen(3000, () => console.log("Airport API ready. Documents at http://localhost:3000/api-docs"))
module.exports = app
