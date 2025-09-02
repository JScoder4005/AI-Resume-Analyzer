import React from "react";
import { Link, useParams } from "react-router";

export const metaData = () => {
  [
    { title: "Resumind | Review" },
    { name: "description", content: "Detailed overview of your resume" },
  ];
};
const Resume = () => {
  const { id } = useParams();
  console.log("Resume ID:", id);
  return (
    <main className="!pt-0">
      <nav className="resume-nav">
        <Link to="/" className="back-button">
          <img
            src="/public/images/back.svg"
            alt="logo"
            className="w-2.5 h-2.5"
          />
          <span className="text-sm text-gray-800 font-semibold">
            Back to homepage
          </span>
        </Link>
      </nav>
    </main>
  );
};

export default Resume;
