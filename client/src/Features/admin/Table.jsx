const Table = ({
  headers = [],
  data = [],
  renderRow,
  className = "",
  theadClassName = "bg-gray-50",
  tbodyClassName = "bg-white",
  onRowClick,
  ...props
}) => {
  return (
    <div className={`overflow-x-auto rounded-lg shadow ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className={theadClassName}>
          <tr>
            {headers.map((header) => (
              <th
                key={header.key}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase ${header.className || ""}`}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y divide-gray-200 ${tbodyClassName}`}>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr 
                key={item.id || index}
                onClick={() => onRowClick && onRowClick(item)}
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
              >
                {renderRow(item, index)}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={headers.length}
                className="px-6 py-4 text-center text-sm whitespace-nowrap text-gray-500"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
export default Table;
