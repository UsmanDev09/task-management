interface PaginationProps {
    itemsPerPage: number;
    setItemsPerPage: (itemsPerPage: number) => void;
    setCurrentPage: (currentPage: number | ((prev: number) => number)) => void;
    currentPage: number;
    totalPages: number;
}

const pageSizeOptions = [5, 10, 20, 50];

export function Pagination({ itemsPerPage, setItemsPerPage, setCurrentPage, currentPage, totalPages } : PaginationProps) {
    return (
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white">Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 bg-green-600 text-white"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span className="text-sm text-white">entries</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-[var(--table-border)] text-white hover:bg-gray-600 disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 ${
                currentPage === page 
                  ? 'bg-green-600 text-white' 
                  : 'border border-[var(--table-border)] text-white hover:bg-gray-600'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-[var(--table-border)] text-white hover:bg-gray-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    )
}