import { useState } from "react";
import API from "../api/axios";

function Login(){

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const login = async(e)=>{

e.preventDefault();

try{

const res = await API.post("/auth/login",{email,password});

localStorage.setItem("token",res.data.token);
localStorage.setItem("user",JSON.stringify(res.data.user));

window.location.href="/matches";

}catch{

alert("Invalid credentials");

}

};

return(

<div className="min-h-screen bg-[#020617] flex items-center justify-center text-white p-6">

<div className="w-full max-w-md">

<h1 className="text-3xl font-black text-center text-green-400 mb-2">
🥅 Virtual EPL FOOTBALL 🥅
</h1>

<p className="text-center text-gray-400 text-sm mb-6">
Welcome back. Predict matches and climb the leaderboard. beat the Odd.
</p>

<form onSubmit={login} className="bg-[#0f172a] p-6 rounded-xl border border-gray-800">

<input
type="email"
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
Login
</button>

</form>

<p className="text-xs text-gray-500 text-center mt-6">
Virtual instant football betting only..  developed for entertainment purposes only.
Balances hold no real world 🌎 monetary value.
</p>

</div>

</div>

)

}

export default Login;
