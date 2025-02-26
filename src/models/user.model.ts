import mongoose from "mongoose";
import validator  from "validator";

interface Iuser extends Document{
    _id:string,
    name:string,
    email:string,
    photo:string,
    gender:"male"|"female",
    role:"admin"|"user",
    dob:Date,
    createdAt:Date,
    updatedAt:Date,
    age:number
}

const userSchema=new mongoose.Schema({
    _id:{
        type:String,
        required:[true,"Please enter the _id"]
    },
    name:{
        type:String,
        required:[true,"Please enter the name"],
    },
    email:{
        type:String,
        required:[true,"Please enter the email"],
        unique:[true,"Email already exists"],
        lowercase:[true,"Email must be small letter"],
        validate:validator.default.isEmail
    },
    gender:{
        type:String,
        required:[true,"Please enter the gender"],
        enum:["male","female"]
    },
    photo:{
        type:String,
        required:[true,"Please add the photo"]
    },
    role:{
        type:String,
        enum:["admin","user"],
        default:"user"
    },
    dob:{
      type:Date,
      required:[true,"Please enter the date of birth"],
    },
},{timestamps:true});

userSchema.virtual("age").get(function(){
    const today=new Date();
    const dob=this.dob;
    let age=today.getFullYear()-dob.getFullYear();
    if(today.getMonth()<dob.getMonth()||(today.getMonth()==dob.getMonth()&&today.getDate()<dob.getDate()))
    {
        age--;
    }
    return age;
})

const userModel= mongoose.model<Iuser>("user",userSchema);

export default userModel;