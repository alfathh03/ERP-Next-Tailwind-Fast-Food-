interface RFQDetailProps {
  params: { id: string };
}

export default function RFQDetailPage({ params }: RFQDetailProps) {
  const { id } = params;

  // contoh dummy data detail
  const detail = {
    vendor: "PT Segar Abadi",
    status: "Draft",
    items: [
      { product: "Daging Sapi", qty: 10, uom: "Kg" },
      { product: "Tortilla Wrap", qty: 25, uom: "Pack" },
      { product: "Bumbu Kebab", qty: 5, uom: "Pack" },
      { product: "Keju Slice", qty: 50, uom: "Pcs" },
    ],
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">
        Detail RFQ: {id}
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow max-w-4xl">

        <p className="text-gray-800 mb-2">
          <strong>Vendor:</strong> {detail.vendor}
        </p>

        <p className="text-gray-800 mb-4">
          <strong>Status:</strong> {detail.status}
        </p>

        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Daftar Item Bahan
        </h2>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-gray-700 font-semibold">
              <th className="py-2">Produk</th>
              <th>Jumlah</th>
              <th>Satuan</th>
            </tr>
          </thead>

          <tbody>
            {detail.items.map((item, i) => (
              <tr key={i} className="border-b">
                <td className="py-2">{item.product}</td>
                <td>{item.qty}</td>
                <td>{item.uom}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}
