
/* -------------------------------------------------------------------------- */
/*                             External Dependency                            */
/* -------------------------------------------------------------------------- */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*                             Internal Dependency                            */
/* -------------------------------------------------------------------------- */
import logo from '../assets/install-logo.png';
import { CheckDownloadStatus } from '../../wailsjs/go/src/Downloader';
import InstallLayout from '../components/layouts/InstallLayout';
import { Loader } from '../components/loader';

const WelcomePage: React.FC = () => {
    const navigate = useNavigate();
    useEffect(() => {
        Load();
    }, []);
    
    const Load = async () => {
        const downloadStatus = await CheckDownloadStatus();
        if (downloadStatus) {
            console.log("Download complete");
            return navigate('/auth', { replace: true });
        } else {
            console.log("Download not complete");
            return navigate('/install', { replace: true });
        }
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
            <div className="w-[450px] h-[550px] overflow-hidden top-0 mt-16" />
            <Loader className='w-[30px] h-[30px] my-4' />
            <div className="w-full border-2 border-white max-w-md bg-transparent h-[54px] rounded-full py-2 px-4 flex items-center justify-center">
            <p className="text-xl font-bold text-white">Decentralize website builder</p>
            </div>
        </InstallLayout>
    );
};

export default WelcomePage;
