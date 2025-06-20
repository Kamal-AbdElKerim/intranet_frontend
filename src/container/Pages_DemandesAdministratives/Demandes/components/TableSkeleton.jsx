import React from 'react';

function TableSkeleton() {
  const columns = Array(6).fill(null);
  const rows = Array(5).fill(null);

  return (
    <div className="animate-pulse">
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="ti-custom-table ti-custom-table-head w-full text-sm">
            <thead className="bg-gray-50 dark:bg-black/20">
              <tr>
                {columns.map((_, index) => (
                  <th key={`header-${index}`} scope="col" className="px-3 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {rows.map((_, rowIndex) => (
                <tr key={`row-${rowIndex}`} className="hover:bg-gray-50 dark:hover:bg-black/20">
                  {columns.map((_, colIndex) => (
                    <td key={`cell-${rowIndex}-${colIndex}`} className="px-3 py-4">
                      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-full"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TableSkeleton; 