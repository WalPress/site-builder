import { useState } from 'react';
import { CreateSite, DeleteSite, GetSite, ListSites, UpdateSite, StartUpload, UploadChunk, FinishUpload, AbortUpload, DeploySite, EstimateStorageCost } from "../../wailsjs/go/src/app";
import { SiteStruct } from "../types/site";
import { v4 as uuidv4 } from 'uuid';
import { useAccount } from '../context/account';
import useNetwork from './useNetwork';

const fileReaderPromise = (reader: FileReader, blob: Blob, readAs: 'readAsDataURL' | 'readAsArrayBuffer' | 'readAsBinaryString' | 'readAsText'): Promise<string | ArrayBuffer | null> => {
    return new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader[readAs](blob);
    });
};

const blobToBase64 = async (blob: Blob): Promise<string> => {
    const reader = new FileReader();
    const result = await fileReaderPromise(reader, blob, 'readAsDataURL');
    if (typeof result !== 'string') {
        throw new Error("Failed to read blob as data URL");
    }
    const commaIndex = result.indexOf(',');
    if (commaIndex === -1) {
        throw new Error("Invalid data URL format from blob reader");
    }
    return result.substring(commaIndex + 1);
};

const useSite = () => {
    const [sites, setSites] = useState<SiteStruct[]>([]);
    const [currentSite, setCurrentSite] = useState<SiteStruct | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { activeWallet } = useAccount();
    const { currentNetwork } = useNetwork();

    const fetchSites = async () => {
        setIsLoading(true);
        try {
            const response = await ListSites(activeWallet);
            if (response && response.length > 0) {
                setSites(response.map((site) => ({
                    id: site.id.toString(),
                    name: site.name,
                    objectId: site.object_id,
                    blobId: site.blob_id,
                    address: site.address,
                    status: site.status,
                    published: site.published,
                    publishedAt: site.published_at,
                    createdAt: site.created_at,
                    updatedAt: site.updated_at,
                })));
            } else {
                setSites([]);
            }
        } catch (err) {
            setError(err as string);
        } finally {
            setIsLoading(false);
        }
    }

    const createSite = async (name: string): Promise<string> => {
        const response = await CreateSite(activeWallet, name, "");
        return response;
    }

    const updateSite = async (id: string, name: string, content: string) => {
        try {
            setIsSaving(true);
            const response = await UpdateSite(id, name, content);
            setIsSaving(false);
            await getSite(id);
            return response;
        } catch (err) {
            setError(err as string);
            setIsSaving(false);
            throw err;
        }
    }

    const getSite = async (id: string) => {
        try {
            const response = await GetSite(id);
            setCurrentSite({
                id: response.id.toString(),
                name: response.name,
                content: response.content,
                blobId: response.blob_id,
                objectId: response.object_id,
                address: response.address,
                status: response.status,
                published: response.published,
                publishedAt: response.published_at,
                createdAt: response.created_at,
                updatedAt: response.updated_at,
            });
        } catch (err) {
            setError(err as string);
            throw err;
        }
    }

    const deleteSite = async (id: string) => {
        try {
            setIsDeleting(true);
            const response = await DeleteSite(id);
            await fetchSites();
            setIsDeleting(false);
            return response;
        } catch (err) {
            setError(err as string);
            setIsDeleting(false);
            throw err;
        }
    }

    const deploySite = async (siteId: string, epoch: number) => {
        try {
            setIsDeploying(true);
            console.log("Deploying site:", epoch, currentNetwork);
            if (!siteId) {
                throw new Error("No site selected");
            }
            const response = await DeploySite(siteId, epoch, "mainnet");
            console.log("Deployed site:", response);
            setIsDeploying(false);
            return response;
        } catch (err) {
            setError(err as string);
            setIsDeploying(false);
            throw err;
        }
    }

    const handleFileUpload = async (file: File, siteId: string): Promise<string> => {
        console.log('Starting chunked upload for file:', file.name, 'to site:', siteId);
        if (!siteId) {
            const msg = "Cannot upload file: Site ID is missing.";
            console.error(msg);
            setError(msg);
            throw new Error(msg);
        }
        if (!file) {
            const msg = "Cannot upload file: File object is missing.";
            console.error(msg);
            setError(msg);
            throw new Error(msg);
        }

        setIsUploading(true);
        setError(null);

        const CHUNK_SIZE = 1024 * 1024;
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        let uploadID: string | null = null;

        try {
            const fileExtension = file.name.split('.').pop() || 'bin';
            const uniqueFileName = `${uuidv4()}.${fileExtension}`;
            const siteUuid = siteId;

            console.log(`Starting upload process for site: ${siteUuid}, target: ${uniqueFileName}`);

            uploadID = await StartUpload(siteUuid, uniqueFileName);
            console.log(`Backend started upload with ID: ${uploadID}`);

            for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                const start = chunkIndex * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunkBlob = file.slice(start, end);

                console.log(`Preparing chunk ${chunkIndex + 1}/${totalChunks} (Bytes: ${start}-${end}) for upload ${uploadID}`);

                const chunkBase64 = await blobToBase64(chunkBlob);

                console.log(`Sending chunk ${chunkIndex + 1}/${totalChunks} (Base64 Length: ${chunkBase64.length})`);

                await UploadChunk(uploadID, chunkBase64);

                console.log(`Chunk ${chunkIndex + 1}/${totalChunks} successfully sent.`);
            }

            console.log(`All chunks sent. Finishing upload ${uploadID}...`);
            const returnedFileName = await FinishUpload(uploadID);
            console.log(`Upload finished. Backend returned filename: ${returnedFileName}`);

            const imageUrl = `/assets/${siteUuid}/${returnedFileName}`;

            setIsUploading(false);
            return imageUrl;
        } catch (err: any) {
            console.error('Chunked file upload failed:', err);
            setError(err.message || 'An unknown error occurred during upload.');

            if (uploadID) {
                console.log(`Attempting to abort failed upload ${uploadID}...`);
                try {
                    await AbortUpload(uploadID);
                    console.log(`Upload ${uploadID} aborted.`);
                } catch (abortErr: any) {
                    console.error(`Failed to abort upload ${uploadID}:`, abortErr);
                }
            }
            setIsUploading(false);
            throw err;
        }
    };

    const estimateStorageCost = async (siteId: string, epoch: number) => {
        try {
            const response = await EstimateStorageCost(siteId, epoch, currentNetwork);
            return response;
        } catch (err) {
            setError(err as string);
            throw err;
        }
    }

    return {
        sites, fetchSites, createSite, updateSite, getSite, isLoading, error, currentSite, deleteSite, isDeleting, handleFileUpload, isUploading, isSaving, isDeploying, deploySite, estimateStorageCost
    }
}

export default useSite; 