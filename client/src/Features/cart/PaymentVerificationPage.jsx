import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import axiosInstance from "../../services/axios.js";
import Spinner from "../../ui/Spinner.jsx";

export default function PaymentVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { reference: pathReference } = useParams();
  const verificationStarted = useRef(false);

  // Paystack appends trxref and reference to the callback URL, 
  // and some flows might append it as a path segment
  const reference = pathReference || searchParams.get("reference") || searchParams.get("trxref");

  useEffect(() => {
    // Only start verification once to avoid double calls
    if (!reference || verificationStarted.current) return;
    
    const verifyPayment = async () => {
      verificationStarted.current = true;
      console.log(`[PaymentVerification] Starting verification for: ${reference}`);
      
      try {
        const { data } = await axiosInstance.get(`/orders/verify/${reference}`);
        
        if (data.status === "success") {
          toast.success("Payment verified successfully!");
          // Navigate to order details
          navigate(`/settings/orders/${data.orderId}?payment=success`, { replace: true });
        } else {
          toast.error(data.message || "Payment verification failed");
          navigate("/settings/orders?payment=failed", { replace: true });
        }
      } catch (error) {
        console.error("[PaymentVerification] Error:", error);
        const message = error.response?.data?.message || "Payment verification failed. Please check your order history.";
        toast.error(message);
        
        // If we have an orderId in the error response, use it
        const orderId = error.response?.data?.orderId;
        if (orderId) {
          navigate(`/settings/orders/${orderId}?payment=failed`, { replace: true });
        } else {
          navigate("/settings/orders?payment=failed", { replace: true });
        }
      }
    };

    verifyPayment();
  }, [reference, navigate]);

  if (!reference) {
    return (
      <div className="flex flex-col items-center justify-center p-10 min-h-[60vh]">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Invalid Payment Reference</h2>
        <button 
          onClick={() => navigate("/settings/orders")}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Go to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-10 min-h-[60vh]">
      <Spinner size="lg" />
      <h2 className="mt-6 text-2xl font-semibold text-gray-800">Verifying Payment...</h2>
      <p className="mt-2 text-gray-500">Please do not refresh the page or close the window.</p>
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100 italic text-sm text-gray-400">
        Ref: {reference}
      </div>
    </div>
  );
}
