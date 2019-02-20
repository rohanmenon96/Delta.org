const uuidv4 = require('uuid/v4');
const bcrypt = require("bcrypt");
const saltRounds = 16;
const MongoCollection = require("./mongoCollection");


async function getUserConnection()
{
	const dbUser = await MongoCollection.getCollectionFn("Users");
	return dbUser;
}

async function getOrgConnection()
{
	const dbOrg = await MongoCollection.getCollectionFn("Org");
	return dbOrg;
}

async function getRequestsConnection()
{
	const dbRequests = MongoCollection.getCollectionFn("Requests");
	return dbRequests;
}

async function addRequest(requestObj)
{
	let dbRequests = await getRequestsConnection();
	let errorArr = new Array();
	
	let finalObj = new Object();
	
	if(await requestObj._id)
	{
		finalObj["_id"] = requestObj._id;
	}
	else
	{
		errorArr.push("Id not provided.");
	}
	
	if(await requestObj.description)
	{
		finalObj["description"] = requestObj.description;
	}
	else
	{
		errorArr.push("Description not provided.");
	}
	
	if(await requestObj.orgId)
	{
		finalObj["orgId"] = requestObj.orgId;
	}
	else
	{
		errorArr.push("Organization not provided.");
	}
	
	if(await requestObj.postedBy)
	{
		finalObj["postedBy"] = requestObj.postedBy;
	}
	else
	{
		errorArr.push("Posted by not provided.");
	}
	
	finalObj["dateCreated"] = new Date();
	
	finalObj["comments"] = new Array();
	
	finalObj["upVote"] = 0;
	
	finalObj["downVote"] = 0;

	finalObj["diff"] = 0;

	finalObj["orgId"] = requestObj.orgId;

	finalObj["isSuggestion"] = requestObj.isSuggestion;
	
	finalObj["assigned"] = "";

	finalObj["institution"] = requestObj.institution;
	
	finalObj["tags"] = new Array();
	
	finalObj["etc"] = "";

	finalObj["AD"] = "";
	
	finalObj["status"] = "Created";
	
	let insertedObj = await dbRequests.insertOne(await finalObj);
	
	return insertedObj;

}


async function getAllRequests()
{
	let dbRequests = await getRequestsConnection();
	
	let objArray = new Array();
	
	objArray = await dbRequests.find({});
	
	if(await objArray.length > 0)
	{
		return await objArray;
	}
	else
	{
		return false;
	}
	
}

async function alterReq(id,alloted,estimated,status)
{
	let dbRequests = await getRequestsConnection();
	
	console.log("\n\n\n\nalloted", alloted)

	let neededReq = await dbRequests.updateOne({_id: id}, {$set: {assigned: alloted, etc: estimated, status: status}});
	
	return await neededReq;
}

async function getRequestsByEnrollmentId(enrolledArr)
{
	dbRequests = await getRequestsConnection();

	console.log("\n\n\nComing inside dbFunction getEn with params", enrolledArr)
	
	let reqArr = await dbRequests.find({orgId : {$in : enrolledArr}}).sort({diff: -1}).toArray();
	// let dummyArr = await dbRequests.find({orgId: "1"}).toArray();
	// console.log("\n\n\ndummyArr: ",dummyArr)

	console.log("reqArr : ", reqArr)
	
	return await reqArr;
}


async function addComments(_id, commentObj)
{
	let dbRequests = await getRequestsConnection();
	
	let reqObj = await dbRequests.find({"_id" : _id});
	
	if(await reqObj)
	{
		let updatedObj = await dbRequests.updateOne({_id : _id}, {$push : {comments : commentObj}});
		
		let updatedObject = await dbRequests.findOne({_id : updatedObj.modifiedId});
		
		return await updatedObject;
	}
	else
	{
		return false;
	}
}

async function addUpVote(_id)
{
	let dbRequests = await getRequestsConnection();
	
	let reqObj = await dbRequests.findOne({_id : _id});
	console.log("=============Coming Inside addupVote with ", reqObj)

	let diff = Number(reqObj.diff);

	diff = diff +1;

	
	if(await reqObj)
	{
		let updatedObj = await dbRequests.updateOne({_id : _id}, {$set : {diff : diff}});
		
		let updatedObject = await dbRequests.findOne({_id : _id});
		
		return await updatedObject;
	}
	else
	{
		return false;
	}
}


async function addDownVote(_id)
{
	let dbRequests = await getRequestsConnection();
	
	let reqObj = await dbRequests.findOne({_id : _id});
	console.log("=============Coming Inside addupVote with ", reqObj)

	let diff = Number(reqObj.diff);

	diff = diff - 1;

	
	if(await reqObj)
	{
		let updatedObj = await dbRequests.updateOne({_id : _id}, {$set : {diff : diff}});
		
		let updatedObject = await dbRequests.findOne({_id : _id});
		
		return await updatedObject;
	}
	else
	{
		return false;
	}
}


const validateEmail = (email)=>{
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

const getUserById = async (_id) => {
    if (!_id){
        throw "No input!"
    }
	
	let dbUser = await getUserConnection(); 
	
    obj = await dbUser.findOne({_id: _id});
	
    if (await obj)
	{
        return await obj;
    }
	
	return false;
}


const registerUser = async (obj1) => {
    // for (let i in obj1){
    //     if (i==="email"){
    //         if (!validateEmail(obj1[i])){
    //             throw "Invalid email"
    //         }}
    //     if (i === "name"){
    //         if (typeof obj1[i]!=="string" || obj1[i].length===0){
    //             throw "Invalid username!"
    //         }}
    //     if (i === "age"){
    //         let age=Number(obj1[i])
    //         if (typeof age != "number" || obj1[i]<0 || obj1[i]>110){
    //             throw "Invalid value for age!"
    //         }}
    //     if (i === "_id"){
    //         let _id = Number(obj1[i])
    //         if (!_id){
    //             throw "Invalid id!"
    //         }
    //     } 
    //     if (i === "contact"){
    //         let contact = Number(obj1[i])
    //         if (!contact){
    //             throw "Invalid contact number!"
    //         }
    //     }
    //     if (i === "enrolledIn"){
    //         if (!Array.isArray(obj1[i])){
    //             throw "Invalid enrollments!"
    //         }
    //     } 
    // }
    let dbUser = await getUserConnection()

    let insertedObj = await dbUser.insertOne(obj1)
    if (await insertedObj){
        return true;
    }
    return false;
}


const getAllUsers = async () => {
	
	let dbUser = await getUserConnection();
	
    return await dbUser.findAll({});
}

const getUserByEmail = async (email) => {
	
	let dbUser = await getUserConnection();
	
    if (!email){
        throw "No email provided"
    }
    obj = await dbUser.findOne({email:email})
    if (await obj){
        return obj
    }
}

async function getRequestById(_id)
{
	let dbRequests = await getRequestsConnection();
	
	let retrivedObj = await dbRequests.findOne({_id : _id});
	
	return  retrivedObj;
}

module.exports = {alterReq,getAllUsers,registerUser, getUserById, addDownVote, addUpVote, addComments, getAllRequests, addRequest, getUserByEmail, getRequestsByEnrollmentId, getRequestById };
