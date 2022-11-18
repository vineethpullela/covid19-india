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
    module.exports = app.listen(3002, () => {
      console.log("Server Running on http://localhost:3002");
    });
  } catch (e) {
    console.log("DB error ${e.message}");
    process.exit(1);
  }
};
module.exports = app;
startCovidDbServer();

//API 1

app.get("/states/", async (request, response) => {
  const getAllStatesQuery = `
    select * from state`;
  const dbArray = await db.all(getAllStatesQuery);
  const responseStatesObject = dbArray.map((state) => {
    return {
      stateId: state.state_id,
      stateName: state.state_name,
      population: state.population,
    };
  });
  response.send(responseStatesObject);
});

//API 2

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    select * from state where state_id = ${stateId};`;
  const state = await db.get(getStateQuery);
  const responseStateObject = (state) => {
    return {
      stateId: state.state_id,
      stateName: state.state_name,
      population: state.population,
    };
  };
  const resultState = responseStateObject(state);
  response.send(resultState);
});

//API 3

app.post("/districts/", async (request, response) => {
  const stateDetails = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = stateDetails;
  const createDistrictQuery = `
INSERT INTO district (district_name,state_id,cases,cured,active,deaths)
VALUES ('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;
  await db.run(createDistrictQuery);
  response.send("District Successfully Added");
});

// API 4

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `SELECT * FROM district WHERE district_id = ${districtId};`;
  const district = await db.get(getDistrictQuery);
  const responseDistrict = (district) => {
    return {
      districtId: district.district_id,
      districtName: district.district_name,
      stateId: district.state_id,
      cases: district.cases,
      cured: district.cured,
      active: district.active,
      deaths: district.deaths,
    };
  };
  const resultDistrict = responseDistrict(district);

  response.send(resultDistrict);
});

//API 5

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
    DELETE FROM district WHERE district_id = ${districtId};`;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

//API 6

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const stateDetails = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = stateDetails;
  const updateStateQuery = `
    UPDATE district SET district_name= '${districtName}',state_id = ${stateId},cases=${cases},cured=${cured},active=${active},deaths=${deaths} where district_id=${districtId};`;

  await db.run(updateStateQuery);
  response.send("District Details Updated");
});

//API 7

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateStatisticsQuery = `
    SELECT sum(cases) as totalCases,sum(cured) as totalCured,sum(active) as totalActive,sum(deaths) as totalDeaths FROM district where state_id = ${stateId};`;
  const stateStatistics = await db.get(getStateStatisticsQuery);
  response.send(stateStatistics);
});

//API 8

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getStateNameQuery = `
    SELECT state_name FROM district LEFT JOIN state ON district.state_id = state.state_id WHERE district_id = ${districtId};`;
  const stateNames = await db.all(getStateNameQuery);
  const responseState = (stateNames) => {
    return {
      stateName: stateNames.state_name,
    };
  };
  const resultState = responseState(stateNames);

  response.send(resultState);
});
