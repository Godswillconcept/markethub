const BuyerInformation = ({ actualOrder }) => {
  // Or directly in the main component
  if (!actualOrder?.user || !actualOrder?.delivery_address) {
    return <div>No buyer data available</div>; // Fallback for safety
  }

  // Derive full name
  const fullName = `${actualOrder.user.first_name} ${actualOrder.user.last_name}`;

  // Derive shipping address (combine fields for readability)
  const shippingAddress = `${actualOrder.delivery_address.address_line}, ${actualOrder.delivery_address.city}, ${actualOrder.delivery_address.state}, ${actualOrder.delivery_address.country} ${actualOrder.delivery_address.postal_code}`;

  // Email and phone from user (matches address.phone in this data)
  const email = actualOrder.user.email;
  const phone = actualOrder.user.phone;

  return (
    <section className="mb-6 rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-gray-900">
        Buyer Information
      </h2>
      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
        <div>
          <p className="text-gray-600">
            Full Name:
            <span className="font-medium text-gray-900">{fullName}</span>
          </p>
        </div>
        <div>
          <p className="text-gray-600">
            Shipping Address:
            <span className="font-medium text-gray-900">{shippingAddress}</span>
          </p>
        </div>
        <div>
          <p className="text-gray-600">
            Email:
            <span className="font-medium text-blue-600 hover:underline">
              {email}
            </span>
          </p>
        </div>
        <div>
          <p className="text-gray-600">
            Phone:
            <span className="font-medium text-blue-600 hover:underline">
              {phone}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default BuyerInformation;
