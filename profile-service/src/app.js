require("dotenv").config();

const express = require("express");

const profileRoutes = require("./routes/profileRoutes");
const sendMailRoutes = require("./routes/sendMailRoutes")
const templateRoute = require("./routes/templateRoutes")

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", profileRoutes);
app.use("/", sendMailRoutes);
app.use("/", templateRoute)

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Profile Service running on port ${PORT}`);
});