function Spinner() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="animate-spin h-12 w-12 border-4 border-t-transparent rounded-full" />
        </div>
    )
}
export default Spinner