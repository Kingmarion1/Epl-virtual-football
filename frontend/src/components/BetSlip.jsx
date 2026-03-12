import { useState } from "react";
import API from "../api/axios";

function BetSlip({ selections, clear }) {

  const [stake, setStake] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));

  const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1);

  const potentialWin = stake * totalOdds;

  const placeBet = async () => {

    for (const bet of selections) {

      await API.post("/bets/place", {
        userId: user._id,
        matchId: bet.matchId,
        betType: bet.betType,
        prediction: bet.prediction,
        odds: bet.odds,
        stake
      });

    }

    alert("Bet placed");

    clear();

  };

  return (

    <div className="bg-gray-900 text-white p-4 w-72 fixed right-0 top-0 h-screen">

      <h2 className="font-bold mb-3">Bet Slip</h2>

      {selections.map((s, i) => (

        <div key={i} className="text-sm border-b py-2">

          {s.team} - {s.prediction} ({s.odds})

        </div>

      ))}

      <input
        type="number"
        placeholder="Stake"
        className="w-full p-2 text-black mt-3"
        onChange={(e) => setStake(e.target.value)}
      />

      <div className="mt-3 text-sm">

        Odds: {totalOdds.toFixed(2)}

      </div>

      <div className="text-green-400">

        Win: {potentialWin.toFixed(2)}

      </div>

      <button
        onClick={placeBet}
        className="bg-green-600 w-full p-2 mt-3"
      >
        Place Bet
      </button>

    </div>

  );

}

export default BetSlip;
