const express = require("express");
const path = require("path");

const app = express();
const PORT = 2000;


app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/public/views"));


app.get("/", (req, res)=>{
    res.render("home")
});
app.get("/about", (req, res) =>{
    res.render("about")
});
app.get("/contact", (req, res) =>{
    res.render("contact")
});

app.post("/api/bmi", (req, res) => {
    const { height, weight } = req.body;

    if (!height || !weight) {
        return res.status(400).json({ error: "Height and weight are required" });
    }

    const h = height / 100;
    const bmi = weight / (h * h);

    let category = "";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 24.9) category = "Normal";
    else if (bmi < 29.9) category = "Overweight";
    else category = "Obese";

    res.json({
        bmi: bmi.toFixed(2),
        category
    });
});
app.listen(PORT,(err)=>{
    if(err){
        console.log("Error in saving");
    }
    console.log("Server running in port ",PORT);
})
