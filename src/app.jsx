import React, { useState, useRef } from "react";


const GOFILE_SERVERS_URL = "https://api.gofile.io/servers";


const App = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("ready");
  const [resultUrl, setResultUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");


  const fileInputRef = useRef(null);


  const findBestServer = async () => {
    const response = await fetch(GOFILE_SERVERS_URL);
    if (!response.ok) throw new Error("Unable to find Gofile server");
    const data = await response.json();
    if (data.status !== "ok") throw new Error("Invalid server response");
    return data.data.servers[0].name;
  };


  const uploadFileToServer = async (server, fileToUpload) => {
    const url = `https://${server}.gofile.io/uploadFile`;
    const formData = new FormData();
    formData.append("file", fileToUpload);
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (data.status !== "ok") throw new Error(data.error || "Upload failed");
    return data.data.downloadPage;
  };


  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("Please select a file first.");
      return;
    }


    setResultUrl(null);
    setErrorMessage("");
    setStatus("finding_server");


    try {
      const server = await findBestServer();
      setStatus("uploading");
      const link = await uploadFileToServer(server, file);
      setResultUrl(link);
      setStatus("success");
    } catch (err) {
      setErrorMessage(err.message);
      setStatus("error");
    }
  };


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus("ready");
    setResultUrl(null);
    setErrorMessage("");
  };


  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };


  const getButtonText = () => {
    switch (status) {
      case "finding_server": return "Finding Server...";
      case "uploading": return "Uploading File...";
      case "success": return "Upload Complete!";
      case "error": return "Upload Failed";
      default: return "Upload File to Gofile";
    }
  };


  const isUploading = status === "finding_server" || status === "uploading";


  const getButtonStyles = (primary) => {
    const base = "w-full py-3 rounded-xl font-bold transition duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-center";
    if (primary) return `${base} ${isUploading ? 'bg-indigo-400 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'}`;
    return `${base} bg-white text-gray-800 border border-gray-300 hover:bg-gray-100`;
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 md:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-800 flex items-center justify-center">
            File Upload Runner
          </h1>
          <p className="text-sm text-gray-500 mt-2">Powered by Gofile.io</p>
        </header>


        <main className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button onClick={triggerFileInput} className={getButtonStyles(false)} disabled={isUploading}>
            {file ? `Selected: ${file.name}` : "Tap to Select File"}
          </button>


          <button onClick={handleUpload} className={getButtonStyles(true)} disabled={isUploading || !file || status === "success"}>
            {getButtonText()}
          </button>


          {(errorMessage || resultUrl || status === "uploading") && (
            <div className={`p-4 rounded-xl border-l-4 mt-6 ${status === 'success' ? 'bg-green-50 border-green-500 text-green-800' : status === 'error' ? 'bg-red-50 border-red-500 text-red-800' : 'bg-blue-50 border-blue-500 text-blue-800'}`}>
              {errorMessage && <p className="font-medium">{errorMessage}</p>}
              {resultUrl && (
                <>
                  <p className="font-semibold mb-2">Upload Link Ready!</p>
                  <a href={resultUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline break-all text-indigo-600 hover:text-indigo-800">{resultUrl}</a>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};


export default App;
