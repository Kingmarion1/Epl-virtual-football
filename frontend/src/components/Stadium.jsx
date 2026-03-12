function Stadium({ children }) {

  return (

    <div className="bg-green-900 min-h-screen flex items-center justify-center">

      <div className="bg-green-600 w-[900px] h-[500px] rounded-xl border-8 border-white flex items-center justify-center">

        {children}

      </div>

    </div>

  );

}

export default Stadium;
