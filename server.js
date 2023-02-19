const express = require("express")
const app = express()
const port = process.env.PORT || 3000

app.use(express.static("public"))

app.use(express.json())

const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({extended: true}))

const exphbs = require('express-handlebars')
app.engine('.hbs', exphbs.engine({ extname: '.hbs' }))
app.set('view engine', '.hbs')

// setup sessions
const session = require('express-session')
app.use(session({
   secret: "the quick brown fox jumped over the lazy dog 1234567890",  // random string, used for configuring the session
   resave: false,
   saveUninitialized: true
}))


const mongoose = require("mongoose")
mongoose.connect("mongodb+srv://dbUser:myPassword@fullstackclass.eicixfq.mongodb.net/Fitness?retryWrites=true&w=majority")

const Schema = mongoose.Schema
const classSchema = ({title:String, instructor:String, duration:Number, link:String})
const Class = mongoose.model("classes", classSchema)

const accountSchema = new Schema ({userEmail:String, userPassword:String})
const userData = mongoose.model("accounts", accountSchema)

const classesUserSchema = new Schema ({userEmail:String, title:String, instructor:String, duration:Number})
const classesUserData = mongoose.model("userClasses", classesUserSchema)

const transactionSchema = {Name: String, Email: String, Membership: String, CardNumber: Number, CardExpiryDate: String, ToTal: String, Order: Number}
const Transaction = mongoose.model("transactions", transactionSchema)

let checklogin=false
let Admin=false
let classesData = {}
let ranNum


app.get("/", (req, res) => {
   res.render("home_page", {layout: "primary", cssFileName:"home_page.css", checklogin, Admin})
   console.log(`classes data`)
   console.log(classesData)
})

app.post("/", (req, res) => {
   res.redirect("/classes")
})
app.get("/userclass", (req, res) => {
   
   classesUserData.find().lean().exec()
   .then((results)=>{         
       res.send(results)
   })
   .catch((err)=>{
      return res.send(err)
   })
})

app.get("/classes", (req,res) => {   
   let user = ""
   if (req.session.loggedInUser !== undefined){
       user = req.session.loggedInUser.userEmail
   } 

       Class.find().lean().exec()
       .then((results)=>{         
           if (results.length === 0) {
               console.log("There are no results found")
               res.send("No class found")
               return
           }
            res.render("classes_page", { layout:"primary", classList:results, user:user, cssFileName:"classes_page.css", checklogin, Admin})      
            return
       })
       .catch((err)=>{
           return res.send(err)
       })
})
//return db to purchase page
app.get("/class", (req, res) => {

   classesUserData.find({userEmail: req.session.loggedInUser.userEmail}).lean().exec()
   .then((results)=>{         
       console.log(results)
       if (results.length === 0) {
           console.log("There are no results found")
           res.send("No orders found")
           return
       }
       res.send(results)      
       return
   })
   .catch((err)=>{
       return res.send(err)
   })
})

app.post("/classes", (req,res)=> {
   if (req.session.loggedInUser === undefined) {
      console.log("user not found")
      return res.redirect("/login")
  }
}) 

app.post("/classes/:id", (req, res) => {
   const classeSelected = req.params.id 

    Class.findOne({_id: classeSelected}).lean().exec()
    .then((result)=>{
       if (result === null) {      
       }
       else {
         console.log(result)
         const userDataAdd = new classesUserData({userEmail:req.session.loggedInUser.userEmail, title:result.title, 
                                                  instructor:result.instructor, duration:result.duration})
            userDataAdd.save()
            .then((createdUser)=> {
               
               if (createdUser === null) {
                  return res.redirect("/classes")
               }
               else {
                  return res.redirect("/classes")
               }
               })
               .catch( (err)=> {
               return res.status(500).send(err)
               })
       }
    })
    .catch((err) => {
       return res.status(500).send(err)
    }) 

})

app.get("/admin", (req, res) => {

   if (Admin===true) {
      Transaction.find().lean().exec()
      .then((results)=>{         
       console.log(results)
       if (results.length === 0) {
           console.log("There are no results found")
           res.send("No orders found")
           return
       }
       res.render("receipts_page",{layout:"primary", orderList:results, cssFileName:"receipts_page.css", checklogin, Admin})      
       return
      })
      .catch((err)=>{
         return res.send(err)
      })
   }
   else{
      return res.redirect("/login")
   }
})

app.get("/login", (req, res)=>{
   res.render("login_page", {layout:"primary",  cssFileName:"login_page.css", checklogin, Admin})
})

app.post("/login", (req,res)=> {

    console.log("data from client")
    console.log(req.body)

    const usermailFromRequest = req.body.mailFromClient
    const passwordFromRequest = req.body.passwordFromClient

   if(usermailFromRequest==="Admin" && passwordFromRequest==="Admin"){
      Admin=true
   }
   else{
      if (usermailFromRequest.trim() === "" || passwordFromRequest.trim() === "" || usermailFromRequest === undefined || passwordFromRequest === undefined) {
         return res.render("login_page", {layout:"primary", cssFileName:"login_page.css", errMsg:"Please fill al the data", checklogin})
      }
   
      const verify_email=expReg = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
       let verify_email2=verify_email.test(usermailFromRequest)
   
       if (verify_email2 === false) {
         return res.render("login_page", {layout:"primary", cssFileName:"login_page.css", errMsg:"Email is not correct data", checklogin})
      }
   }
   
   if(req.body.account_btn==="")
   {
      userData.findOne({userEmail: usermailFromRequest}).lean().exec()
      .then((result)=>{
         if (result === null) {      
            
            const userDataAdd = new userData({userEmail: usermailFromRequest, userPassword: passwordFromRequest})
            userDataAdd.save()
            .then((createdUser)=> {
               console.log(createdUser)
               if (createdUser === null) {
                  return res.render("login_page", {layout:"primary", errMsg:"Insertion failed! Try again!", checklogin})
               }
               else {
                  checklogin=true
                  req.session.loggedInUser = createdUser
                  return res.redirect("/classes")
               }
            })
            .catch( (err)=> {
               return res.status(500).send(err)
            })
         }
         else {
            return res.render("login_page", {layout:"primary", cssFileName:"login_page.css", errMsg:"This user already exists.", checklogin})
         }
      })
      .catch((err) => {
         return res.status(500).send(err)
      }) 
   }
   
   else{
      userData.findOne({userEmail: usermailFromRequest}).lean().exec()
      .then((result)=>{
         if (result === null) {      
            return res.render("login_page", {layout:"primary", cssFileName:"login_page.css", errMsg:"User not found.", checklogin})
         }
   
         const matchingUser = result
         if (matchingUser.userPassword === passwordFromRequest) {
            checklogin=true
            req.session.loggedInUser = matchingUser
            res.redirect("/classes")
         }
         else {
            return res.render("login_page", {layout:"primary", cssFileName:"login_page.css", errMsg:"Incorrect password.", checklogin})
         }
      })
      .catch((err) => {
         return res.status(500).send(err)
      })   
   }
})

app.get("/error", (req, res)=>{
   res.render("error_page", {layout:"primary",  cssFileName:"error_page.css", checklogin, Admin})
})

app.post("/error", (req, res) => {
   res.redirect("/classes")
})

app.get("/purchase", (req, res) => {

   if(req.session.loggedInUser === undefined ){
      res.redirect("/login")
   }
   else{
      classesUserData.find({userEmail: req.session.loggedInUser.userEmail}).lean().exec()
       .then((results)=>{         
           if (results.length === 0 && Admin===false) {
            return res.redirect("/error")
           }
           classesDataUser=results
           res.render("purchase_page",{ layout:"primary", classList:results, cssFileName:"purchase_page.css", checklogin, Admin})      
           return
       })
       .catch((err)=>{
           return res.send(err)
       })
   }
})

app.post("/purchase", (req, res) => {
   
   ranNum = Math.floor(Math.random() * 10000)
   const transactionToAdd = new Transaction({Name: req.body.Name, Email: req.body.Email, Membership: req.body.Membership, 
                                             CardNumber: req.body.CardNumber, CardExpiryDate: req.body.CardExpiryDate,
                                             ToTal: req.body.ToTal, Order: ranNum})
   transactionToAdd.save()
   .then((createdTrans)=>{
           if (createdTrans !== null) {
               console.log("Transaction was succesfully created")
               console.log(createdTrans)
               }
      })
      .catch((err)=> { return res.send(err)})
   
      classesUserData.deleteMany({userEmail: req.session.loggedInUser.userEmail}).lean().exec()
       .then((results)=>{         
           if (results.length === 0) {
            return res.redirect("/error")
           }     
           return
       })
       .catch((err)=>{
           return res.send(err)
       })
       
})

app.get("/confirmed", (req, res)=>{
   res.render("confirmed_page", {layout:"primary",  cssFileName:"confirmed_page.css", ranNum, checklogin, Admin})
})

app.post("/confirmed", (req, res) => {
   res.redirect("/")
})

app.post("/delete/:id", (req, res) => {
   const idToDelete = req.params.id   
   classesUserData.deleteOne({_id: idToDelete}).lean().exec()
   .then(() => {
       return res.redirect("/purchase")
   })
   .catch((err) => {
       return res.status(500).send(err)
   })
})

app.get("/logout", (req, res) => {
   checklogin=false
   Admin=false
   req.session.loggedInUser = undefined  
   res.redirect("/")
})

app.use((req,res) => {
   res.status(404).render("error404_page", {layout:"primary",  cssFileName:"error404_page.css", checklogin, Admin})
})

const startServer = () => {
   console.log(`The server is running on http://localhost:${port}`)
   console.log(`Press CTRL + C to exit`)
}
app.listen(port, startServer)