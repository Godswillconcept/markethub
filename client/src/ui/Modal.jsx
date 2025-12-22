import { XMarkIcon } from "@heroicons/react/24/outline";

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed top-0 left-0 w-screen h-screen z-50 flex items-center justify-center bg-gray bg-opacity-10 backdrop-blur-sm">
            <div className="relative max-h-[100vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
                {/* Modal Header */}
                <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 hover:bg-gray-100"
                    >
                        <XMarkIcon className="h-6 w-6 text-gray-600" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(80vh - 80px)' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;