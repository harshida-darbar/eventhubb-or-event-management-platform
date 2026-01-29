import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { toast } from "react-toastify";
import { Scanner } from "@yudiel/react-qr-scanner";
import { SlCalender } from "react-icons/sl";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

function QrScanner() {
  const navigate = useNavigate();
  const [scannedId, setScannedId] = useState("");
  const [scanning, setScanning] = useState(true);

  const handleScan = async (result) => {
    if (!result || !result[0]) return;

    const id = result[0].rawValue;
    setScannedId(id);
    setScanning(false);

    try {

      const docRef = doc(db, "orders", id);
      const docSnap = await getDoc(docRef);

      if(!docSnap.exists()){
        toast.error("ticket not founddd....");
        return;
      }

      const data = docSnap.data();
      if(data.isScanned === true){
        toast.info("Already useddd..");
        navigate('/ticketsview',{state: {ticket: {id}, showQR:false }
        });
        return;
      }
      
      toast.success("QR Scanned Successfully!");
        navigate('/ticketsview',{state: {ticket: {id}, showQR:false }
        });
    } catch (err) {
      toast.error("not scanned");
    }

   navigate("/ticketsview", {
  state: { ticket: { id }, showQR: false, isOrganizer: true }
});

  };
  
  const handleError = () => {
    toast.error("Failed to Scan");
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-xl p-5 flex items-center gap-3">
        <IoArrowBack
          onClick={() => navigate("/maindashboard")}
          size={35}
          className="text-purple-600 cursor-pointer"
        />

        <SlCalender
          size={35}
          className="bg-purple-600 text-white p-1 rounded"
        />
        <h1 className="text-purple-600 text-2xl font-semibold">EventHub</h1>
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-5">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">
          Scan QR Code
        </h2>

        {scanning && (
          <div className="w-[350px] h-[350px] rounded-xl overflow-hidden border-4 border-purple-600 shadow-lg">
            <Scanner onScan={handleScan} onError={handleError} />
          </div>
        )}

        {scannedId && (
          <div className="mt-4 text-purple-600 font-bold bg-white p-3 rounded shadow">
            Scanned ID: {scannedId}
          </div>
        )}
      </div>
    </div>
  );
}

export default QrScanner;
