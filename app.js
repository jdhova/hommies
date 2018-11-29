const express = require("express")
const app = express()
// const axios = require("axios")
const bodyParser = require('body-parser')
var Zillow = require('node-zillow');
var zillow = new Zillow("X1-ZWz1grjn2l63nv_4234r")
const bcrypt = require('bcrypt')
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

app.use(cookieParser("juuuuude"))


// MongoDB Connect
mongoose.connect('mongodb://localhost/video', {
    usedNewUrlParse : true
})

// Login Models
var Schema = mongoose.Schema;


// // Bookmark Models

// const Schema = mongoose.Schema;

const Bookmarks = mongoose.model('Bookmarks', new Schema({ 
    
    zestimateval : Number,
    address :  String,
    highestimate: Number,
    lowestimate : Number, 
    valuechange : Number, 
    neigborhoodtype : String, 
    neigborhood : String, 
    indexvalue :String 
}), 'Bookmarks');

    // Bookmark Models

    // const Bookmarks = mongoose.model("Bookmarks", authorSchema);

    // module.exports = Bookmarks;  this should be to export Bookmarks to Bookmarks.js

    // new updated Username Schema relationship with user

    // const Schema   = mongoose.Schema;
    
    const Users = mongoose.model('users', new Schema({ 

        firstname: String,
        lastname: String,
        username: String,
        password: String,
        Bookmarks : [ { type : mongoose.Schema.Types.ObjectId, ref: 'Bookmarks' } ]
    }), 'users');

// static files
app.use(express.static("public"));

// Middleware
app.use(bodyParser.urlencoded({extended:false}));

const hbs = require("hbs");
hbs.registerPartials(__dirname + '/views/partials');

app.set('views', __dirname + '/views');   // handle bars
app.set('view engine', 'hbs');

//API  Routes
app.get("/estimates", function(req, res) {
    res.render("estimates", {login: "Log In",signup: "Sign Up"})  
})

// Login and Signup get routes

app.get("/login", function(req, res) {
    res.render("login", {login: "Log In", signup: "Sign Up"})  
})

app.get("/signup", function(req, res) {
    res.render("signup", {login: "Log In", signup: "Sign Up"})  
})


app.get("/Bookmarks", function(req, res) {
    res.redirect("login",{login: "Log In", signup: "Sign Up"})  
    // dont know if i can redirect to login hbs?
})



// API Post Routes

app.post('/estimates',function (req,res) {

    let params = {
        address: req.body.address,
        citystatezip: req.body.citystatezip
    }
    params["zws-id"] = "X1-ZWz1grjn2l63nv_4234r"
     
    zillow.get("GetSearchResults", params)
    .then( result => {
        
        
        res.render('estimatesResult',{
            zestimateval: result.response.results.result[0].zestimate[0].amount[0]["_"], 
            address:     result.response.results.result[0].address[0].street[0],
            mapthishome : result.response.results.result[0].links[0].mapthishome[0],
            comparable : result.response.results.result[0].links[0].comparables[0],
            highestimate: result.response.results.result[0].zestimate[0].valuationRange[0].high[0]["_"],
            lowestimate : result.response.results.result[0].zestimate[0].valuationRange[0].high[0]["_"],
            valuechange :  result.response.results.result[0].zestimate[0].valueChange[0]["_"],
            neigborhoodtype : result.response.results.result[0].localRealEstate[0].region[0].$.type,
            neigborhood : result.response.results.result[0].localRealEstate[0].region[0].$.name,
            indexvalue : result.response.results.result[0].localRealEstate[0].region[0].zindexValue[0],
            login: "Log In", 
            signup: "Sign Up"
        })
    })
    .catch(error=> {  
    })  

})




//  Signup Post Routes

app.post("/signup", function(req, res) {

    bcrypt.hash(req.body.password, 5, function(err, hash) {
        if (err) {
            res.end("error");
            throw err;
        }  
        var newUser = new Users ({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            username: req.body.username,
            password: hash
        })

        newUser.save((err) => {
            if (err) {
                res.send ("no way")
            }
            else {
              //  res.render('/sign-up') 
              res.redirect('login')
               // res.send("thanks for siginig up!")   // and render the login page
            }
        })

    })

 })


 // Login Post Route

 app.post ("/login", function (req ,res) {
        
    var password = req.body.password
    const username = req.body.username 
    
    Users.find({username: req.body.username}, (err, result) => {
      

        if (err) {
            res.send("no way today try tomorrow")
        }
        else if (result.length === 0) {
            res.send("lol")
        }
         else{
            bcrypt.compare(req.body.password, result[0].password , function(err, match) {
              //  console.log("sjjsjsjjjs",match)
                if (match) {
                    res.cookie("loggedIn", "true", {signed: true})
                    res.redirect("loginresult") 
                    }
                // else{
                //     //password is wrong
                // }
            })
        }
    }) 
})




app.listen(3000, () => {
    console.log("hello working")
});