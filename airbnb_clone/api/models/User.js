var mongoose=require("mongoose");
var {Schema}=mongoose;

var UserSchema=new Schema({
name:String,
email:{type:String,unique:true},
password:String,
});

var UserModel=mongoose.model("User", UserSchema);

module.exports= UserModel;

