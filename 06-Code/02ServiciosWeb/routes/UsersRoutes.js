const { request } = require("express");
const express = require("express");
const router = express.Router();
const Users = require("../models/Users")

module.exports = router;

// GET all the users
router.get("/users", async (req, res) => {
    // Easter Egg code 418 Teapot
    if(req.body.name != null){
        console.log("I'm not a teapot")
        res.status(418).json({message:"The server refuses the attempt to brew coffee with a teapot. This services does not use parameters"})
    }
    
    try {
        const usersData = await Users.find();
        res.status(200).json(usersData);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})

// GET users by code
router.get("/users/:code", async (req,res) => {
    try {
        const usersData = await Users.find({"code":req.params.code});
        res.status(200).json(usersData)
    } catch (error) {
        res.status(500).json({message:error.message})
    }
})

// POST a new users
router.post("/users", async (req,res) => {
    let newUsers = new Users({
        idCard: req.body.idCard,
        name: req.body.name,
        address: req.body.address,
        cellphone: req.body.cellphone,
        email: req.body.email
    })

    try {
        const usersToSave = await newUsers.save();
        res.status(200).json({message: "Succesfully Created new Users", usersToSave})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// PUT Update users parameters based on code
router.put("/users/:code", async (req, res) => {
    // Find out if that users code exists and save on variable
    let usersOld;
    try {
        await Users.findOne({"code":req.params.code}, (err, result) => {
            if(err){
                res.status(500).json({message: err.message});
            }
            else if(!result){
                res.status(404).json("There is no Users with that code");
            }
            else{
                console.log("result: " + result)
                usersOld = result;
            }
        }).clone(); 
        //Used this because if not Atlas does not like repeated queries 
        // https://stackoverflow.com/questions/68945315/mongooseerror-query-was-already-executed
    } catch (error) {
        res.status(500).json({message: error.message});
    }

    let newUsers = {};
    
    // Update local variable with parameters that have been sent, no Upsert
    let requestParameters = Object.keys(req.body);
    if (requestParameters.includes("idCard")) newUsers.idCard = req.body.idCard;
    if (requestParameters.includes("name")) newUsers.name = req.body.name;
    if (requestParameters.includes("address")) newUsers.address = req.body.address;
    if (requestParameters.includes("cellphone")) newUsers.cellphone = req.body.cellphone;
    if (requestParameters.includes("email")) newUsers.email = req.body.email;

    console.log(newUsers)
    // Do the Updating
    try {
        const filter = { code: req.params.code };
        const update = newUsers;

        let updatedUsers = await Users.findOneAndUpdate(filter, update, {
            new: true,
            upsert: false
        });

        console.log("updated Users: " + updatedUsers);
        res.status(200).json({ message:"Success at Updating item of Menu",
                                newUsers: updatedUsers })

    } catch (error) {
        res.status(500).json({message: error.message});
    }
})