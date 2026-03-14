import { useState } from "react";
import API from "../api/axios";

function BetSlip({ selections, clear }) {

  const [stake, setStake] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));

  const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1);

  const potentialWin = stake * totalOdds;

  const placeBet = async () => {

    if (stake <= 0) {
      alert("Enter a valid stake");
      return;
    }

    if (stake > user.balance) {
      alert("Insufficient balance");
      return;
    }

    try {

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

      const updatedUser = {
        ...user,
        balance: user.balance - stake
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Bet placed successfully");

      clear();
      setStake(0);

    } catch (err) {

      alert("Bet failed");

    }

  };

  return (

    <div className="fixed bottom-0 left-0 right-0 md:right-0 md:left-auto md:top-0 md:h-screen md:w-80 bg-[#020617] border-t md:border-l border-gray-800 text-white p-4 z-50">

      <h2 className="font-bold text-lg mb-3 text-green-400">
        Bet Slip
      </h2>

      {selections.length === 0 && (
        <p className="text-gray-500 text-sm">
          No selections yet
        </p>
      )}

      {selections.map((s, i) => (

        <div key={i} className="text-sm border-b border-gray-800 py-2">

          <div className="font-semibold">
            {s.team}
          </div>

          <div className="text-gray-400">
            {s.prediction} @ {s.odds}
          </div>

        </div>

      ))}

      <input
        type="number"
        placeholder="Enter Stake"
        className="w-full p-2 mt-3 rounded bg-black border border-gray-700"
        value={stake}
        onChange={(e) => setStake(Number(e.target.value))}
      />

      <div className="mt-3 text-sm flex justify-between">

        <span>Total Odds</span>

        <span>{totalOdds.toFixed(2)}</span>

      </div>

      <div className="text-green-400 flex justify-between font-bold">

        <span>Potential Win</span>

        <span>${potentialWin.toFixed(2)}</span>

      </div>

      <button
        disabled={stake <= 0 || selections.length === 0}
        onClick={placeBet}
        className="bg-green-600 w-full p-3 mt-3 rounded disabled:bg-gray-700 font-bold"
      >
        Place Bet
      </button>

      <button
        onClick={clear}
        className="w-full mt-2 text-sm text-red-400"
      >
        Clear Slip
      </button>

    </div>

  );

}

export default BetSlip;
