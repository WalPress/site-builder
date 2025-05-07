
/* -------------------------------------------------------------------------- */
/*                             External Dependency                            */
/* -------------------------------------------------------------------------- */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';


/* -------------------------------------------------------------------------- */
/*                             Internal Dependency                            */
/* -------------------------------------------------------------------------- */
import logo from '../assets/install-logo.png';
import { GetProgress, DownloadAllBinaries } from '../../wailsjs/go/src/Downloader';
import InstallLayout from '../components/layouts/InstallLayout';
import { Loader } from '../components/loader';

const InstallPage: React.FC = () => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("idle");
    const startedRef = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        console.log("start download");
        if (!startedRef.current) {
            startedRef.current = true;
            startDownload();
        }

        const interval = setInterval(async () => {
            const p = await GetProgress();
            setProgress(p);
            if (status === "idle") setStatus("Downloading");
            if (p >= 100){
                clearInterval(interval);
                setStatus("Completed");
                navigate("/auth");
            }
        }, 500);
        return () => clearInterval(interval);
    }, []);

    console.log(progress, status);
    const startDownload = async () => {
        DownloadAllBinaries("testnet")
        .then(() => setStatus("Completed"))
        .catch((err: any) => {
          console.error(err);
          setStatus("Error");
        });
    };
  return (
    <InstallLayout>
      <div className="w-[450px] h-[450px] rounded-full overflow-hidden  fixed">
        <img
          src={logo} // Replace with your image path
          alt="Profile"
          className="w-full h-full object-cover transition-opacity duration-2000 animate-[shimmer_1.5s_infinite]"
        />  
      </div>
      <div className="w-[450px] h-[550px] overflow-hidden top-0 mt-28" />
        {status == "idle" && <Loader className='w-[30px] h-[30px] my-4' />}
        <div className="w-full border-2 border-white max-w-md bg-transparent h-[54px] rounded-full py-2 px-4 flex items-center justify-center">
          <p className="text-xl font-bold text-white">Decentralize website builder</p>
        </div>
        {status == "Downloading" &&
            <>
                <div className="w-full max-w-md mt-8 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full text-xs font-medium text-blue-100 text-center p-0.5 leading-none" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-white text-sm">downloading modules...</p>
                <p className="text-white text-sm">{progress}%</p>
            </>
        }
    </InstallLayout>
  );
};

export default InstallPage;
