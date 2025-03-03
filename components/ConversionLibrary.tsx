import React from "react";

const ConversionLibrary = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-black">Conversion Library</h2>
        <div className="mt-4 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search ..."
            className="border border-gray-300 rounded-md p-2 bg-gray-100"
          />
          <div className="flex items-center space-x-2">
            <p className="text-black">Page 1 of 1</p>
            <a href="#" className="text-black">
              {"< Previous"}
            </a>
            <a href="#" className="text-black">
              {"Next >"}
            </a>
          </div>
        </div>
        <div className="mt-4">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-black">PDF</th>
                <th className="text-left text-black">STATUS</th>
                <th className="text-left text-black">DATE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="3" className="text-center text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 inline-block mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Please login to view your library
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ConversionLibrary;
