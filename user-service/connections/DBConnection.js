const mongoose = require("mongoose")

let db1
let db2

const dbConnection_1 = async () => {

    try{
        const URL = "mongodb://localhost:27017/newProject"
        db1 = await mongoose.createConnection(URL).asPromise()

        // console.log("MongoDb dbConnection_1 connection")
        // console.log("DB1:", db1.name); // newProject
        return db1
    } catch (error){
        console.log("Database connection error : ", error)
        throw error
    }
}

const dbConnection_2 = async () => {

    try{
        const URL = "mongodb://localhost:27017/secondaryProject"
        db2 = await mongoose.createConnection(URL).asPromise()

        // console.log("DB2:", db2.name); // secondaryProject
        // console.log("MongoDb dbConnection_2 connection")

        return db2
    } catch (error){
        console.log("Database connection error : ", error)
        throw error
    }
}

module.exports = {
    dbConnection_1,
    dbConnection_2
};