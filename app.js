const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());

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
values('${districtName}',${stateId},${cases},${cured},${active});`;
  await db.run(createDistrictQuery);
  response.send("District Successfully Added");
});

// API 4

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `select * from district where district_id = ${districtId};`;

  const district = await db.get(getDistrictQuery);
  response.send(district);
});

//API 5

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
    delete from district where district_id=${districtId};`;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

//API 6

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const sateDetails = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = stateDetails;
  const updateStateQuery = `
    update district SET district_name='${districtName}',state_id=${stateId},cases=${cases},active=${cured},deaths=${active} where district_id=${districtId};`;

  await db.run(updateStateQuery);
  response.send("District Details Updated");
});

//API 7

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateStatisticsQuery = `
    select avg(cases) as totalCases,avg(cured) as totalCured,avg(active) as totalActive,avg(deaths) as totalDeaths from state where state_id = ${stateId};`;
  const stateStatistics = await db.get(getStateStatisticsQuery);
  response.send(stateStatistics);
});

//API 8

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getStateNameQuery = `
    select state_name from state left join district where district_id= ${districtId};`;

  const stateNames = await db.all(getStateNameQuery);
  response.send(stateNames);
});
