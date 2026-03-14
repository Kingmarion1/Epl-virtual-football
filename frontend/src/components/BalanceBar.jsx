import { useEffect, useState } from "react";

function BalanceBar(){

const [user,setUser] = useState(null);

useEffect(()=>{

const stored = localStorage.getItem("user");

if(stored){
setUser(JSON.parse(stored));
}

},[]);

if(!user) return null;

return(

<div className="fixed top-3 right-3 z-50">

<div className="bg-[#020617]/90 backdrop-blur-md border border-green-600/40 px-4 py-2 rounded-xl shadow-lg">

<div className="text-[10px] text-gray-400 uppercase">
Balance💰:
</div>

<div className="text-green-400 font-bold text-lg">
${user.balance.toLocaleString()}
</div>

</div>

</div>

)

}

export default BalanceBar;
