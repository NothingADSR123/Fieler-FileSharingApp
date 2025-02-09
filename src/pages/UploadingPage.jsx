import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import logo from "../assets/logo.png"

const UploadingPage = () => {
  // State variables for files and download links
  const [files, setFiles] = useState([]);
  const [downloadLink, setDownloadLink] = useState(""); // For a single file
  const [downloadAllLink, setDownloadAllLink] = useState(""); // For multiple files

  // Handle file selection via drag and drop
  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  // Remove a file from the list
  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: "image/*, application/pdf, .txt",
  });

  // Function to upload files
  const shareFiles = async () => {
    if (files.length === 0) return alert("No files to share!");

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/upload/multiple`,
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        // If one file is uploaded, set its individual download link.
        if (data.files.length === 1) {
          setDownloadLink(data.files[0].fileUrl);
          setDownloadAllLink(""); // Clear any existing "download all" link.
        }
        // If more than one file is uploaded, create a download-all link using the returned batch ID.
        else if (data.files.length > 1) {
          setDownloadLink(""); // Clear individual link.
          setDownloadAllLink(
            `${import.meta.env.VITE_BACKEND_URL}/upload/download-all/${
              data.uploadBatchId
            }`
          );
        }
      } else {
        alert("Upload failed: " + data.message);
      }
    } catch (error) {
      console.error("Error sharing files:", error);
      alert("Error uploading file.");
    }
  };

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-transparent backdrop-filter backdrop-blur-lg"
      >
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
  <motion.div whileHover={{ scale: 1.1 }} className="flex items-center space-x-3">
    <img src={logo}   alt="Logo" className="h-10 rounded-lg" />
    <span className="text-2xl font-bold">Fieler</span>
  </motion.div>
</div>

      </motion.header>

      {/* Main content */}
      <div className="flex-grow">
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold mb-6"
            >
              Share Files with Ease
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-xl mb-8"
            >
              Fast, secure, and simple file sharing for everyone
            </motion.p>
          </div>

          <div
            {...getRootProps()}
            className="border-2 max-w-2xl mx-auto border-dashed border-yellow-400 p-6 rounded-lg cursor-pointer flex flex-col items-center justify-center"
          >
            {/* Hidden Input Field */}
            <input {...getInputProps()} />
            {/* Drag & Drop Text */}
            <p className="text-lg mb-4">
              {isDragActive
                ? "Drop the files here..."
                : "Drag & drop files here, or click to select"}
            </p>
            {/* Upload Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-yellow-400 text-purple-800 font-bold py-3 cursor-pointer px-8 rounded-full text-lg shadow-lg hover:bg-yellow-300 transition-colors"
            >
              Upload Files
            </motion.button>
          </div>

          {/* Display Selected Files */}
          {files.length > 0 && (
            <div className="mt-6 w-full justify-items-center text-center">
              <ul className="list-none space-y-2">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center w-2xl justify-between p-3 rounded shadow"
                  >
                    <span className="text-sm">
                      {index + 1}) {file.name} ({(file.size / 1024).toFixed(2)}{" "}
                      KB)
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      className="ml-4 bg-white text-black px-2 py-1 cursor-pointer rounded text-sm hover:bg-red-600 transition"
                    >
                      ❌
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Share Button */}
          {files.length > 0 && (
            <div className="flex justify-center mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-500 cursor-pointer text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-green-400 transition-colors"
                onClick={shareFiles}
              >
                Share Files Online
              </motion.button>
            </div>
          )}

          {/* Display Download Link and QR Code for a single file */}
          {downloadLink && (
            <div className="mt-4 text-center flex flex-col items-center">
              <p className="text-lg font-semibold">Download Link:</p>
              <a
                href={downloadLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 bg-white underline text-lg"
              >
                {downloadLink}
              </a>
              <p className="mt-2 text-lg font-semibold">Or Scan the QR Code:</p>
              <div className="mt-2">
                <QRCodeCanvas value={downloadLink} size={128} />
              </div>
            </div>
          )}

          {/* Display Download-All Link and QR Code for multiple files */}
          {downloadAllLink && (
            <div className="mt-4 text-center flex flex-col items-center">
              <p className="text-lg font-semibold">Download All Files:</p>
              <a
                href={downloadAllLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 bg-white underline text-lg"
              >
                {downloadAllLink}
              </a>
              <p className="mt-2 text-lg font-semibold">Or Scan the QR Code:</p>
              <div className="mt-2">
                <QRCodeCanvas value={downloadAllLink} size={128} />
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-purple-500 py-2">
        <div className="container mx-auto px-4">
          <div className="mt-4 text-center text-sm">
            &copy; {new Date().getFullYear()} Fieler. All rights reserved.
          </div>
        </div>

         {/* Made by GitHub Profile Button */}
         <div className="mt-2 sm:mt-4 text-center">
          <p className="text-xs sm:text-sm">
            Made with ❤️ by{" "}
            <a
              href="https://github.com/nothingADSR123"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center mt-1 sm:mt-2 py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium text-white bg-[#24292F] hover:bg-[#1F4529] rounded-full transition-all duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                width="16"
                height="16"
                fill="currentColor"
                className="mr-1 sm:mr-2 sm:w-5 sm:h-5"
              >
                <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38 0-.19-.01-.83-.01-1.5-2.01.44-2.43-.97-2.43-.97-.33-.84-.81-1.07-.81-1.07-.66-.45.05-.44.05-.44.73.05 1.11.75 1.11.75.65 1.11 1.71.79 2.12.6.07-.47.25-.79.45-.97-1.77-.2-3.63-.89-3.63-3.95 0-.87.31-1.58.82-2.14-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.81A7.66 7.66 0 0 1 8 4.5c.68 0 1.36.09 2 .26 1.53-1.02 2.2-.81 2.2-.81.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.14 0 3.07-1.86 3.75-3.63 3.95.25.22.47.66.47 1.33 0 .96-.01 1.74-.01 1.98 0 .21.15.46.55.38A8 8 0 0 0 8 0z" />
              </svg>
              <span className="hidden sm:inline">nothingADSR123</span>
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default UploadingPage;
