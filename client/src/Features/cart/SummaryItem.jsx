function SummaryItem({ item }) {
  return (
    <div key={item.id} className="flex gap-4 border-b border-gray-200 pb-4">
      <img
        src={item.imageUrl}
        alt={item.name}
        className="h-24 w-24 rounded-lg object-cover"
      />
      <div>
        <h3 className="text-lg font-bold">{item.name}</h3>
        <p className="text-sm text-gray-500">
          Product Category: {item.category}
        </p>
        {item.selected_variants && item.selected_variants.length > 0 && (
          <p className="text-sm text-gray-500 capitalize">
            {item.selected_variants.map((v, i) => (
              <span key={i}>
                {i > 0 && " / "}
                {v.name}: {v.value}
              </span>
            ))}
          </p>
        )}
        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
        <p className="text-sm text-gray-500">
          Estimated Delivery Date: {item.deliveryDate}
        </p>
      </div>
    </div>
  );
}

export default SummaryItem;
