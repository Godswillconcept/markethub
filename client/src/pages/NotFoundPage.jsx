import { Link } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-page flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full mx-auto">
                {/* Main 404 Content */}
                <div className="text-center animate-fade-in">
                    {/* Animated 404 Illustration */}
                    <div className="relative mb-8">
                        {/* Main 404 number with gradient background */}
                        <div className="mt-2.5 ">
                            <div className="text-6xl sm:text-8xl font-bold bg-gradient-to-r from-accent text-black animate-pulse">
                                404
                            </div>
                        </div>

                    </div>

                    {/* Main heading with bounce animation */}
                    <div className="flex flex-col items-center justify-center mb-6">
                        <FaExclamationTriangle className="text-[100px] mb-4 animate-pulse" />
                        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary animate-bounce" style={{ animationDuration: '2s' }}>
                            Oops! Page Not Found
                        </h1>
                    </div>

                    {/* Subtitle */}
                    <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
                        Looks like you've wandered off the beaten path. Don't worry, every explorer gets lost sometimes!
                    </p>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            to="/"
                            className="group inline-flex items-center gap-3 bg-accent px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:bg-zinc-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                        >
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Go Home
                        </Link>

                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-3 bg-white text-text-primary px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-muted-border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Go Back
                        </button>
                    </div>

                    {/* Footer message */}
                    <div className="mt-10 text-center text-text-muted">
                        <p className="text-sm">
                            Still can't find what you're looking for?{" "}
                            <Link to="/settings/support" className="text-accent hover:underline font-medium">
                                Contact our support team
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}