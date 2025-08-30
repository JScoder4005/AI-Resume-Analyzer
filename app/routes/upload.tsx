// import { prepareInstructions } from "/constants";
// import { useState, type FormEvent } from "react";
// import { useNavigate } from "react-router";
// import FileUploader from "~/components/FileUploader";
// import Navbar from "~/components/navbar";
// import { convertPdfToImage } from "~/lib/pdf2img";
// import { usePuterStore } from "~/lib/puter";
// import { generateUUID } from "~/lib/utils";

// const Upload = () => {
//   const { auth, isLoading, fs, ai, kv } = usePuterStore();
//   const navigate = useNavigate();
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [statusText, setStatusText] = useState("");
//   const [file, setFile] = useState<File | null>(null);

//   const handleFileSelect = (file: File | null) => {
//     setFile(file);
//   };

//   const handleAnalyze = async ({
//     companyName,
//     jobTitle,
//     jobDescription,
//     file,
//   }: {
//     companyName: string;
//     jobTitle: string;
//     jobDescription: string;
//     file: File;
//   }) => {
//     setIsProcessing(true);
//     setStatusText("Uploading the file...");
//     const uploadedFile = await fs.upload([file]);

//     if (!uploadedFile) return setStatusText("Error: Failed to upload file");
//     setStatusText("Converting to image...");

//     const imageFile = await convertPdfToImage(file);

//     if (!imageFile)
//       return setStatusText("Error: Failed to convert PDF to image");

//     setStatusText("Uploading the file...");
//     if (!imageFile.file)
//       return setStatusText("Error: Failed to convert PDF to image");
//     const uploadedImage = await fs.upload([imageFile.file]);
//     if (!uploadedImage) return setStatusText("Error: Failed to upload image");

//     setStatusText("Preparing data...");

//     const UUID = generateUUID();

//     const data = {
//       id: UUID,
//       resumePath: uploadedFile.path,
//       imagePath: uploadedImage.path,
//       companyName,
//       jobTitle,
//       jobDescription,
//       feedback: "",
//     };
//     await kv.set(`resume:${UUID}`, JSON.stringify(data));

//     setStatusText("Analyzing...");

//     const feedback = await ai.feedback(
//       uploadedFile.path,
//       prepareInstructions({ jobTitle, jobDescription })
//     );
//     if (!feedback) return setStatusText("Error: Failed to analyze resume");

//     const feedbackText =
//       typeof feedback.message.content === "string"
//         ? feedback.message.content
//         : feedback.message.content[0].text;

//     data.feedback = JSON.parse(feedbackText);
//     await kv.set(`resume:${UUID}`, JSON.stringify(data));
//     setStatusText("Analysis complete, redirecting...");
//     console.log(data);
//     navigate(`/resume/${UUID}`);
//   };

//   const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const form = e.currentTarget.closest("form");
//     if (!form) return;
//     const formData = new FormData(form);

//     const companyName = formData.get("company-name") as string;
//     console.log(formData.get("company-name"));
//     const jobTitle = formData.get("job-title") as string;
//     const jobDescription = formData.get("job-description") as string;

//     console.log({ companyName, jobTitle, jobDescription, file });
//     if (!file) return;
//     handleAnalyze({ companyName, jobTitle, jobDescription, file });
//   };

//   return (
//     <main className="bg-[url('/images/bg-auth.svg')] bg-cover">
//       <Navbar />
//       <section className="main-section">
//         <div className="page-heading py-16">
//           <h1 className="text-2xl font-bold">
//             Smart Feedback for Your Dream Job
//           </h1>

//           {isProcessing ? (
//             <>
//               <h2>{statusText}</h2>
//               <img
//                 src="/images/resume-scan.gif"
//                 alt="Scanning resume"
//                 className="w-full"
//               />
//             </>
//           ) : (
//             <h2>Drop your resume for an ATS score and improvement tips</h2>
//           )}

//           {!isProcessing && (
//             <form
//               id="upload-form"
//               onSubmit={handleSubmit}
//               className="flex flex-col gap-4 mt-8"
//             >
//               <div className="form-div">
//                 <label htmlFor="company-name">Company Name</label>
//                 <input
//                   type="text"
//                   name="company-name"
//                   placeholder="Company Name"
//                   id="company-name"
//                 />
//               </div>
//               <div className="form-div">
//                 <label htmlFor="job-title">Job Title</label>
//                 <input
//                   type="text"
//                   name="job-title"
//                   placeholder="Job Title"
//                   id="job-title"
//                 />
//               </div>
//               <div className="form-div">
//                 <label htmlFor="job-description">Job Description</label>
//                 <textarea
//                   rows={4}
//                   name="job-description"
//                   placeholder="Job Description"
//                   id="job-description"
//                 />
//               </div>
//               <div className="form-div">
//                 <label htmlFor="uploader">Upload Resume</label>
//                 <FileUploader onFileSelect={handleFileSelect} />
//               </div>
//               <button type="submit" className="primary-button">
//                 Analyze Resume
//               </button>
//             </form>
//           )}
//         </div>
//       </section>
//     </main>
//   );
// };

// export default Upload;

import { prepareInstructions } from "/constants";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/navbar";
import { convertPdfToImage } from "~/lib/pdf2img";
import type { PdfConversionResult } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    try {
      setIsProcessing(true);

      console.log("=== Starting Analysis ===");
      console.log("File:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      setStatusText("Uploading the file...");
      const uploadedFile = await fs.upload([file]);

      console.log("Upload result:", uploadedFile);

      if (!uploadedFile || !uploadedFile.path) {
        throw new Error("Failed to upload file - no path returned");
      }

      setStatusText("Converting PDF to image...");

      // Use the original File object for conversion (not the upload result)
      const imageConversionResult: PdfConversionResult =
        await convertPdfToImage(file);

      console.log("Conversion result:", imageConversionResult);

      let uploadedImage = null;

      // Check if conversion was successful
      if (imageConversionResult.error) {
        console.warn("Image conversion failed:", imageConversionResult.error);
        setStatusText("Image conversion failed, continuing with PDF only...");
      } else if (imageConversionResult.file) {
        setStatusText("Uploading converted image...");

        try {
          uploadedImage = await fs.upload([imageConversionResult.file]);
          console.log("Image upload result:", uploadedImage);

          if (!uploadedImage) {
            console.warn("Image upload failed, continuing without image");
          }
        } catch (imageUploadError) {
          console.warn("Image upload error:", imageUploadError);
        }
      } else {
        console.warn("No image file returned from conversion");
      }

      setStatusText("Preparing data...");
      const UUID = generateUUID();

      const data = {
        id: UUID,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage ? uploadedImage.path : null, // Allow null if no image
        companyName,
        jobTitle,
        jobDescription,
        feedback: "",
      };

      console.log("Saving data to KV store:", { id: UUID, data });
      await kv.set(`resume:${UUID}`, JSON.stringify(data));

      setStatusText("Analyzing resume with AI...");

      try {
        const feedback = await ai.feedback(
          uploadedFile.path,
          prepareInstructions({ jobTitle, jobDescription })
        );

        console.log("AI feedback received:", feedback);

        if (!feedback) {
          throw new Error("No feedback received from AI");
        }

        const feedbackText =
          typeof feedback.message.content === "string"
            ? feedback.message.content
            : feedback.message.content[0]?.text;

        if (!feedbackText) {
          throw new Error("No feedback text received from AI");
        }

        console.log("Raw feedback text:", feedbackText);

        // Try to parse as JSON, fallback to raw text
        try {
          data.feedback = JSON.parse(feedbackText);
        } catch (parseError) {
          console.warn(
            "Failed to parse feedback as JSON, using raw text:",
            parseError
          );
          data.feedback = feedbackText;
        }

        // Update data in KV store
        await kv.set(`resume:${UUID}`, JSON.stringify(data));

        setStatusText("Analysis complete, redirecting...");
        console.log("Final data:", data);

        // Navigate to results page
        setTimeout(() => {
          navigate(`/resume/${UUID}`);
        }, 1500);
      } catch (aiError) {
        console.error("AI analysis failed:", aiError);
        throw new Error(
          `AI analysis failed: ${aiError instanceof Error ? aiError.message : String(aiError)}`
        );
      }
    } catch (error) {
      console.error("Analysis error:", error);
      setStatusText(
        `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      );
      setIsProcessing(false); // Important: reset processing state
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Better form handling
    const form = e.currentTarget;
    const formData = new FormData(form);

    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    console.log("Form data:", { companyName, jobTitle, jobDescription, file });
    console.log("File object:", file);

    // Validation
    if (!companyName?.trim()) {
      setStatusText("Error: Company name is required");
      return;
    }

    if (!jobTitle?.trim()) {
      setStatusText("Error: Job title is required");
      return;
    }

    if (!jobDescription?.trim()) {
      setStatusText("Error: Job description is required");
      return;
    }

    if (!file) {
      setStatusText("Error: Please select a PDF file");
      return;
    }

    // Start analysis
    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  return (
    <main className="bg-[url('/images/bg-auth.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1 className="text-2xl font-bold">
            Smart Feedback for Your Dream Job
          </h1>

          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img
                src="/images/resume-scan.gif"
                alt="Scanning resume"
                className="w-full"
              />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement tips</h2>
          )}

          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name *</label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="Company Name"
                  id="company-name"
                  required
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title *</label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="Job Title"
                  id="job-title"
                  required
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description *</label>
                <textarea
                  rows={4}
                  name="job-description"
                  placeholder="Job Description"
                  id="job-description"
                  required
                />
              </div>
              <div className="form-div">
                <label htmlFor="uploader">Upload Resume (PDF) *</label>
                <FileUploader onFileSelect={handleFileSelect} />
                {file && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {file.name} selected
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="primary-button"
                disabled={!file || isProcessing}
              >
                {isProcessing ? "Processing..." : "Analyze Resume"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default Upload;
