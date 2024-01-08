import express from "express";
import fs from "fs";
import Papa from 'papaparse'
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.post("/addProperty", async (req, res) => {
  const inputFile = "./public/jigawa_ward.geojson";
  const outputFile = "./public/outfil.geojson";
  // const wards = req.body.wards;
  let wards

const csvData = fs.readFileSync("../jigawa_state_wards.csv", "utf8");
Papa.parse(csvData, {
  header: true,
  skipEmptyLines: true,
  complete: function (results) {
    const jsObjects = results.data;
    // console.log(jsObjects);
    // res.json(jsObjects);
    wards = jsObjects
  },
  error: function (error) {
    console.error("CSV parsing error:", error.message);
  },
});


  try {
    const fileData = fs.readFileSync(inputFile, "utf8");
    let geojson = JSON.parse(fileData);

    const updatedFeatures = geojson.features.map((feature) => {
      const matchingWard = wards.find(
        (ward) => ward.ward === feature.properties.ward_name
      );

      if (matchingWard) {
        // Add properties to the feature based on the matching ward
        feature.properties.ward_id = matchingWard.ward_id;
        feature.properties.additionalProperty = matchingWard.additionalProperty;
      }

      return feature;
    });

    const updatedGeoJSON = { ...geojson, features: updatedFeatures };
    const updatedGeoJSONString = JSON.stringify(updatedGeoJSON, null, 2);

    fs.writeFileSync(outputFile, updatedGeoJSONString, "utf8");

    res.json({
      success: true,
      message: "Properties added successfully!",
    });
  } catch (error) {
    console.error(error.stack);
    res.json({ success: false, error: error.message });
  }
});


app.get('/parse', (req,res)=>{

const inputFile = "./public/jigawa_state_local_govts.csv";
const outputFile = "./public/jigawa_wards_o.js";
const csvData = fs.readFileSync("../jigawa_state_wards.csv", "utf8");

Papa.parse(csvData, {
  header: true,
  skipEmptyLines: true,
  complete: function (results) {
    const jsObjects = results.data;
    // console.log(jsObjects);
    res.json(jsObjects)
    fs.writeFileSync(outputFile,jsObjects,"utf-8")
  },
  error: function (error) {
    console.error("CSV parsing error:", error.message);
  },
});

})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
