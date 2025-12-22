import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"

function AdminProductStatsCard({ title, value, change, type, icon }) {
    return (<>

        {/* Units Sold Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow" >
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-lg font-bold text-gray-900">
                        {value}
                    </p>
                </div>
                {icon}
            </div>
            <p className="text-sm">
                {type === "up" ? (
                    <span className="inline-flex items-center font-medium text-green-600">
                        <ArrowUpIcon className="mr-1 h-4 w-4" />
                        {change}% Up from past week
                    </span>
                ) : (
                    <span className="inline-flex items-center font-medium text-red-600">
                        <ArrowDownIcon className="mr-1 h-4 w-4" />
                        {change}% Down from past week
                    </span>
                )}
            </p>
        </div>
    </>)
}

export default AdminProductStatsCard
