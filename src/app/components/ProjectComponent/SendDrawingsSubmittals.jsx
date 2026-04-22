"use client";

import React from "react";

const inputClass = "border border-gray-300 rounded-md px-2 py-1 mt-2 w-full focus:outline-none transition";
const labelClass = "font-bold text-gray-800 mb-1";
const sectionClass = "flex flex-col gap-5 w-full max-w-[46%] min-w-[350px]";

const SendDrawingsSubmittals = () => {
  return (
    <div className="flex flex-col items-center min-h-screen pt-10 pb-8 bg-gray-50 w-full">
      <h1 className="text-2xl font-bold text-black mb-8 tracking-wide">
        Send Drawings Submittals
      </h1>
      <form className="flex flex-row gap-10 justify-center w-full max-w-[1500px] px-6">
        {/* Left Section */}
        <div className={sectionClass}>
          <div>
            <label className={`${labelClass}`}>Project No.</label>
            <select className={inputClass + " ml-4 max-w-[200px]"}>
              <option>Select</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Project TL Name</label>
            <input type="text" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Cc Emails :</label>
            <input type="text" className={inputClass} />
          </div>
           <div>
            <label className={labelClass}>Mail Text :</label>
            <textarea
              rows="4"
              className={inputClass + " resize-none min-h-[92px]"}
            />
          </div>
          <div className="flex items-center gap-6">
            <button
              type="submit"
              className="bg-teal-700 hover:bg-teal-900 px-7 py-2 rounded-md text-white font-semibold shadow transition"
            >
              Publish
            </button>
            <label className="flex items-center gap-2 font-bold text-gray-800">
              <input type="checkbox" className="h-5 w-5 accent-teal-600" />
              Don't send mails 
            </label>
          </div>
        </div>
        {/* Right Section */}
        <div className={sectionClass}>
          <div>
            <label className={labelClass}>Project Name</label>
            <input type="text" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Client TL Name</label>
            <input type="text" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Project Type</label>
            <input type="text" className={inputClass} />
          </div>
          <div>
            <label className={`${labelClass}`}>Zip Name</label>
            <input type="text" className={inputClass} />
          </div>
            <div>
            <label className={labelClass}>
              Select <span className="font-bold">.dxf/nc1 Files</span> :
            </label>
            <input type="file" className="mt-1" multiple />
          </div>
        </div>
      </form>
    </div>
  );
};

export default SendDrawingsSubmittals;
