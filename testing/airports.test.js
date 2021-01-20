const app = require('../server')
const request = require('supertest')
const { TestScheduler } = require('jest')


describe("testing /airports path", () =>{
    test("can GET all airports", (done) => {
        request(app)
        .get('/airports')
        .expect(200)
        .expect(response => {
            expect(response.body.length).toBeGreaterThan(28000)
        })
        .end(done)
    })
    test("can GET pages of airports" , (done) =>{
        request(app)
        .get('/airports?page=1')
        .expect(200)
        .expect(response => {
            expect(response.body.length).toBe(100)
        })
        .end(done)

        request(app)
        .get('/airports?page=4&pageSize=53')
        .expect(200)
        .expect(response => {
            expect(response.body.length).toBe(53)
        })
        .end(done)
    })
    test("can POST new airport", (done) => {
        const testAirport = {
            icao: "this",
            iata: "is",
            name: "a",
            city: "test",
            state: "airport",
            country: "IN",
            elevation: 420,
            lat: 69,
            lon: -12,
            tz: "jest"
        }
        request(app)
        .post('/airports')
        .send(testAirport)
        .expect(201)
        .end(done)

        request(app)
        .get('/airports')
        .expect(200)
        .expect(response => {
            expect(response.body[response.body.length-1].city).toBe("test")
        })
        .end(done)
    })

    test("POST 400s if icao already exists",(done)=>{
        const testAirport = {
            icao: "00AK",
            iata: "is",
            name: "a",
            city: "test",
            state: "airport",
            country: "IN",
            elevation: 420,
            lat: 69,
            lon: -12,
            tz: "jest"
        }
        request(app)
        .post('/airports')
        .send(testAirport)
        .expect(400)
        .end(done)
    })
    test("POST 400s if JSON doesn't have the correct fields",(done)=>{
        const testAirport = {
            boop: "00AK",
            adoop: "is",
            name: "a",
            city: "test",
            state: "airport",
            country: "IN",
            elevation: 420,
            lat: 69,
            lon: -12,
            tz: "jest"
        }
        request(app)
        .post('/airports')
        .send(testAirport)
        .expect(400)
        .end(done)
    })
    test("POST 400s if JSON doesn't have the required fields",(done)=>{
        const testAirport = {
            icao: "originalicao",
        }
        request(app)
        .post('/airports')
        .send(testAirport)
        .expect(400)
        .end(done)
    })
    test("POST 415s if not sent JSON",(done)=>{
        request(app)
        .post('/airports')
        .send("<THINGYMAGIG>THING</THINGYMAGIG>")
        .expect(415)
        .end(done)
    })
})



describe("testing /airports/{icao}",()=>{
    test("can GET airport that exists" , (done) =>{
        request(app)
        .get('/airports/1NA9')
        .expect(200)
        .expect(response => {
            expect(response.body.name).toBe("Myran Airstrip")
        })
        .end(done)
    })
    test("GETting airport that doesn't exist 404s",(done)=>{
        request(app)
        .get('/airports/1NAasfsfdsdaf9')
        .expect(404)
        .end(done)
    })
    test("can PUT entire new airport to one that exists" , (done) =>{
        const testAirport = {
            icao: "1NA9",
            iata: "is",
            name: "a",
            city: "test",
            state: "airport",
            country: "IN",
            elevation: 420,
            lat: 69,
            tz: "jest"
        }
        request(app)
        .put('/airports/1NA9')
        .send(testAirport)
        .expect(200)
        .end(done)

        request(app)
        .get('/airports')
        .expect(200)
        .expect(response =>{
            const foundAirport = response.body.filter(obj => {
                return obj.icao == '1NA9'
              })[0]
            expect(foundAirport.tz).toBe('jest')
            expect(foundAirport.lon).toBeFalsy()
        })
        .end(done)
    })
    test("PUT airport 400s if JSON fields don't match schema" , (done) =>{
        const testAirport = {
            lol: "1NA9",
            I: "is",
            changed: "a",
            city: "test",
            state: "airport",
            country: "IN",
            elevation: 420,
            lat: 69,
            lon: -12,
            tz: "jest"
        }
        request(app)
        .put('/airports/1NA9')
        .send(testAirport)
        .expect(400)
        .end(done)
    })
    test("PUT airport 404s if airport doesn't exist" , (done) =>{
        const testAirport = {
            icao: "thisdoesntexist",
            iata: "is",
            name: "a",
            city: "test",
            state: "airport",
            country: "IN",
            elevation: 420,
            lat: 69,
            tz: "jest"
        }
        request(app)
        .put('/airports/thisdoesntexist')
        .send(testAirport)
        .expect(404)
        .end(done)
    })
    test("PUT 415s if request not JSON" , (done) =>{
        request(app)
        .put('/airports/1NA9')
        .send('123123123')
        .expect(415)
        .end(done)
    })
    test("can PATCH a currently existing airport" , (done) =>{
        const testAirport = {
            elevation: 420
        }
        request(app)
        .patch('/airports/LOAA')
        .send(testAirport)
        .expect(200)
        .end(done)

        request(app)
        .get('/airports/LOAA')
        .expect(200)
        .expect(response =>{
            const foundAirport = response.body
            console.log(foundAirport)
            expect(foundAirport.elevation).toBe(420)
            expect(foundAirport.name).toBe('Ottenschlag Airport')
        })
        .end(done)
    })

    test("PATCH 400s if JSON fields don't match schema" , (done) =>{
        const testAirport = {
            lol: "1NA9",
            I: "is",
            changed: "a",
            city: "test",
            state: "airport",
            country: "IN",
            elevation: 420,
            lat: 69,
            lon: -12,
            tz: "jest"
        }
        request(app)
        .patch('/airports/1NA9')
        .send(testAirport)
        .expect(400)
        .end(done)
    })

    test("PATCH 404s if airport does not exist" , (done) =>{
        const testAirport = {
            iaco : "1NA9"
        }
        request(app)
        .patch('/airports/12312')
        .send(testAirport)
        .expect(404)
        .end(done)
    })

    test("PATCH 415s if request isn't JSON" , (done) =>{
        request(app)
        .patch('/airports/1NA9')
        .send("asfkmawkmrf")
        .expect(415)
        .end(done)
    })
    test("can DELETE airport" , (done) =>{
        request(app)
        .delete('/airports/LOAN')
        .expect(204)
        .end(done)

        request(app)
        .get('/airports/LOAN')
        .expect(404)
        .end(done)
    })
    test("DELETE 404s if airport is not found" , (done) =>{
        request(app)
        .delete('/airports/jsndafrwaklfjdngs')
        .expect(404)
        .end(done)
    })
})
