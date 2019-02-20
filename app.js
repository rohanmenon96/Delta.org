const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const exphbs = require("express-handlebars");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const cookieParser = require("cookie-parser");
const UserFunctions = require("./dbFunctions");
const exphndlbars = require("express-handlebars");
const saltRounds = 16;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
app.use(cookieParser());

const static = express.static(__dirname + "/views");
app.use("/views", static);

app.set("view engine", "handlebars");
app.engine("handlebars", exphndlbars({defaultLayout:""}));

app.listen(3000, () => {
  console.log("We've now got a server!");
});

//============================= ROUTES ============================//

/*To Do:
1. Create Middleware
*/


// app.use("/",async(req,res,next)=>{
//   console.log("\n\n\n\nMiddleware Fired\n\n\n")
//   console.log(req.cookies.AuthCookie);
//   if(req.cookies.AuthCookie)
//     {
//       next();
//     }
//   else
//     {
//       res.render("layouts/signin");
//     }
// })


app.get("/",(req,res)=>{
  res.send("This is the homepage");
})

app.get("/login",(req,res)=>{
  //res.send("Login form will be served Here. \nForm Will have 2 buttons -> Login,Signup");
  res.render("layouts/signin");
})

app.post("/login",async(req,res)=>{

  console.log("==============Coming inside /login post route================")
  console.log("req.body: ", req.body)
  console.log("username : ",req.body.email);
  console.log("password: ",req.body.password);
  
	let hashedPass ; 
	let userId ;
	
	const users = await UserFunctions.getUserByEmail(req.body.email);	

		console.log(users.password);
	
	let comparedVal = await bcrypt.compare(req.body.password, users.password);
	
	console.log(comparedVal);

	if(comparedVal)
			{
				res.cookie("AuthCookie", users._id);
				//res.render(__dirname + "/data", {"nameOfTheCourse":nameOfTheCourse, "lastName":lastName, "bio": bio, "profession": profession});
				res.redirect("/homepage");
			}
	else
			{
				let hasErrors = true;
				let errors = [];
				errors.push("username/password does not match");
				res.status(403).render("layouts/signin", {"hasErrors":hasErrors, "errors":errors});
				return;
			}
})

app.get("/signup",(req,res)=>{
  res.render("layouts/signup");
})

app.post("/signup",async(req,res)=>{

  console.log("Request: ", req.body)
  
  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

  let createdUser = {
    "_id": uuid.v4(),
    "usedId": req.body.userId,
    "name" : req.body.name,
    "password": hashedPassword,
    "age" : req.body.age,
    "email": req.body.email,
    "contact": req.body.contact,
    "enrolledIn": [],
    "isAdmin": 0,
    "deltas": 0,
    "changes": []
  }

  let confirmation = await UserFunctions.registerUser(createdUser);
  console.log("Confirmation : ", confirmation);

  res.redirect("/login");
})

app.get("/homepage",async(req,res)=>{
  //req.cookies.AuthCookie
  const user = await UserFunctions.getUserById(req.cookies.AuthCookie);
  console.log("\n\n\nComing Inside /homepage with ", user);
  console.log(user);
  if(user.isAdmin)
  {
    console.log("\n\n\nGoing to render Admin Page\n\n\n")
    const requests = await UserFunctions.getRequestsByEnrollmentId(["1"]);
    console.log("==============All Requests============\n",requests)
    res.render("layouts/mainAdmin", {"requests" : requests});

  }
  else
  {
    console.log("\n\n\nGoing to render User Page\n\n\n")
    const requests = await UserFunctions.getRequestsByEnrollmentId(user.enrolledIn);
    console.log("==============All Requests============\n",requests)
    res.render("layouts/main", {"requests" : requests});
  }
})

app.get("/createRequest",(req,res)=>{
  res.send("Create a request form will be served here. Form will have a submit button");
})

app.post("/createRequest",async(req,res)=>{

  console.log("================Coming inside route /createRequest=============")
  console.log(req.body)

  let createdRequest = {
    "_id" : uuid.v4(),
    "orgId": req.body.orgId,
    "description": req.body.description,
    "postedBy": req.cookies.AuthCookie
  }

  if(req.body.orgId == "1")
    {
      createdRequest.institution = "Stevens Institute of Technology";
    }
  else
    {
      createdRequest.institution = "JP Morgan Chase Co."
    }

    if(req.body.isSuggestion == "true")
    {
      createdRequest.isSuggestion = true;
    }
  else
    {
      createdRequest.isSuggestion = false;
    }

  let confirmation = await UserFunctions.addRequest(createdRequest);
  console.log("Confirmation: " , confirmation)

  res.redirect("/homepage");
})

app.get("/request",async(req,res)=>{
  console.log(req.query);
  let currentRequest = await UserFunctions.getRequestById(req.query.reqId);
  console.log("Coming inside particular req page: ", currentRequest)
  res.render("layouts/DataformsUser", {"requestObj": currentRequest})
})

app.get("/upvote",async(req,res)=>{
  console.log("Coming inside /upvote with data", req.query);
  let updatedObj = await UserFunctions.addUpVote(req.query.id)
  console.log("Returned Object : ", updatedObj);
  res.redirect("/homepage");
})

app.get("/downvote", async(req,res)=>{
  console.log("Coming inside /downvote with data", req.query);
  let updatedObj = await UserFunctions.addDownVote(req.query.id)
  console.log("Returned Object : ", updatedObj);
  res.redirect("/homepage");
})

app.get("/adminHome", async(req,res)=>{
  console.log("coming inside /adminHome")
  res.render("layouts/mainAdmin");
})

app.get("/adminRequest",async(req,res)=>{
  console.log(req.query);
  let currentRequest = await UserFunctions.getRequestById(req.query.reqId);
  console.log("Coming inside particular req page: ", currentRequest)
  res.render("layouts/Dataforms", {"requestObj": currentRequest})
})

app.post("/adminAlterReq",async(req,res)=>{
  console.log("\n\n\nComing inside /adminAlterReq")
  console.log("\n\n\n",req.body);
  let returnedObj = await UserFunctions.alterReq(req.body.id,req.body.allotted,req.body.estimated,req.body.status);
  res.redirect("/homepage");
})