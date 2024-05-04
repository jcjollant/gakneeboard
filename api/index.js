import express from "express";
import cors from "cors";
const gapi = require('../datasource/gapi.js');

const app = express();
const port = 3002

app.use(cors());

app.get("/", (req, res) => res.send("Express on Vercel"));

app.get("/airport/:id", async (req,res) => {
    console.log( "API airport request " + req.params.id);
    const [airportCode, icaoCode] = gapi.getAirportCodes(req.params.id);
    // basic code validation
    if( !airportCode || !icaoCode) {
        res.status(400).send("Invalid airport ID");
        return;
    }

    let airport = await gapi.getAirport(airportCode,icaoCode);
    if( airport) {
        res.send(airport)
    } else {
        res.status(404).send("Airport not found");
    }
})

app.listen(port, () => console.log("Server ready on port " + port));

export default app;
