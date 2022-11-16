const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");
let db = null;
const startCovidDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running on http://localhost:3001");
    });
  } catch (e) {
    console.log("DB error ${e.message}");
    process.exit(1);
  }
};

startCovidDbServer();

//API 1

app.get("/states/", async (request, response) => {
  const getAllStatesQuery = `
    select * from state`;
  const dbArray = await db.all(getAllStatesQuery);
  response.send(dbArray);
});

//API 2

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    select * from state where state_id = ${stateId};`;
  const state = await db.get(getStateQuery);
  response.send(state);
});

//API 3

app.post("/districts/", async (request, response) => {
  const stateDetails = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = stateDetails;
  const createDistrictQuery = `
insert into district (district_name,state_id,cases,cured,active,deaths)
values('${districtName}',${stateId}.${cases},${cured},${active});`;
  await db.run(createDistrictQuery);
  response.send("District Successfully Added");
});
