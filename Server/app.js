const express = require("express")
const app = express();
const dbconnect = require('./config/db.config')
// const morgan = require('morgan')
const cors = require('cors')
require("dotenv").config()
const productRouter = require("./routes/product.routes")
const cartRouter = require("./routes/cart.routes")
const categoryRouter = require("./routes/category.routes")
const subacategoryRouter = require("./routes/subcategory.routes")
const fileUpload = require('express-fileupload');
const UserRegistration = require("./routes/RegistartionRoute");
const orderRouter = require("./routes/order.routes");
const paymentRouter = require("./routes/payment.routes");
const purchaseproduct = require("./routes/purchase.routes");
const adminlogin = require("./routes/admin.routes")
const Contact = require("./routes/Contactroutes")
const BrandRoute =  require("./routes/BrandRoute")
const UserRoute =  require("./routes/userRoute")
const BannerRoute = require("./routes/BannerRoute")
const LoginRoute = require('./routes/userRoute');
const CheckRoute = require("./routes/Checkoutroute")
const PaymentRoute = require("./routes/paymentRoute")
// app.use(morgan('dev'))
app.use(cors())

dbconnect();



  



app.use(fileUpload());


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/product', productRouter)
app.use('/cart', cartRouter)
app.use('/category', categoryRouter)
app.use('/subcategory', subacategoryRouter);
app.use("/user", UserRegistration)
app.use("/order", orderRouter)
app.use("/payments", paymentRouter)
app.use("/purchase", purchaseproduct)
app.use("/admin", adminlogin)
app.use("/contact", Contact)
app.use("/brand", BrandRoute)
app.use("/user", UserRoute)
app.use("/banner", BannerRoute)
app.use("/auth", LoginRoute);
app.use("/paymentuser", PaymentRoute)





app.listen(8080, () => {
    console.log("Server is running on port 8080");
})