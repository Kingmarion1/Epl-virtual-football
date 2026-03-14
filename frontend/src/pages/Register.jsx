import { useState } from "react";
import API from "../api/axios";

function Register(){

const [username,setUsername] = useState("");
const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const register = async(e)=>{

e.preventDefault();

await API.post("/auth/register",{username,email,password});

window.location.href="/login";

};

return(

<div className="min-h-screen bg-[#020617] flex items-center justify-center text-white p-6">

<div className="w-full max-w-md">

<h1 className="text-3xl font-black text-center text-green-400 mb-2">
🥅 Join Virtual⚽EPL Football 🥅 
</h1>

<p className="text-center text-gray-400 text-sm mb-6">
Create your Epl Football account and start predicting matches. Beat the ODDS.
</p>

<form onSubmit={register} className="bg-[#0f172a] p-6 rounded-xl border border-gray-800">

<input
placeholder="Username"
className="w-full mb-3 p-3 rounded bg-black border border-gray-700"
onChange={(e)=>setUsername(e.target.value)}
/>

<input
placeholder="Email"
className="w-full mb-3 p-3 rounded bg-black border border-gray-700"
onChange={(e)=>setEmail(e.target.value)}
/>

<input
type="password"
placeholder="Password"
className="w-full mb-4 p-3 rounded bg-black border border-gray-700"
onChange={(e)=>setPassword(e.target.value)}
/>

<button className="w-full bg-green-600 py-3 rounded font-bold">
Create Account
</button>

</form>

<p className="text-xs text-gray-500 text-center mt-6">
This platform carries a professional football betting experience.
All credits are virtual and cannot be withdrawn.
</p>

</div>

</div>

)

}

export default Register;
