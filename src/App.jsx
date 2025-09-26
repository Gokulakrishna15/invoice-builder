import React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import jsPDF from "jspdf";

function App() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const [client, setClient] = useState({
    name: "",
    address: "",
    invoiceNumber: "",
    date: "",
  });

  const [items, setItems] = useState([
    { description: "", quantity: 1, rate: 0, amount: 0 },
  ]);

  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, total: 0 });

  useEffect(() => {
    const subtotal = items.reduce(
      (acc, item) => acc + item.quantity * item.rate,
      0
    );
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    setTotals({ subtotal, tax, total });
  }, [items]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = field === "description" ? value : Number(value);
    updatedItems[index].amount =
      updatedItems[index].quantity * updatedItems[index].rate;
    setItems(updatedItems);
  };

  const addItem = () =>
    setItems([...items, { description: "", quantity: 1, rate: 0, amount: 0 }]);

  const removeItem = (index) =>
    setItems(items.filter((_, i) => i !== index));

  const onSubmit = () => {
    console.log("Form is valid. Ready to export or preview.");
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(18);
    doc.text("Invoice", 90, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Client Name: ${client.name}`, 10, y);
    y += 7;
    doc.text(`Address: ${client.address}`, 10, y);
    y += 7;
    doc.text(`Invoice Number: ${client.invoiceNumber}`, 10, y);
    y += 7;
    doc.text(`Date: ${client.date}`, 10, y);
    y += 10;

    doc.setFontSize(14);
    doc.text("Items", 10, y);
    y += 7;

    doc.setFontSize(12);
    doc.text("Description", 10, y);
    doc.text("Qty", 80, y);
    doc.text("Rate", 100, y);
    doc.text("Amount", 130, y);
    y += 7;

    items.forEach((item) => {
      doc.text(item.description, 10, y);
      doc.text(String(item.quantity), 80, y);
      doc.text(`₹${item.rate}`, 100, y);
      doc.text(`₹${item.amount.toFixed(2)}`, 130, y);
      y += 7;
    });

    y += 10;
    doc.text(`Subtotal: ₹${totals.subtotal.toFixed(2)}`, 130, y);
    y += 7;
    doc.text(`Tax (18%): ₹${totals.tax.toFixed(2)}`, 130, y);
    y += 7;
    doc.text(`Total: ₹${totals.total.toFixed(2)}`, 130, y);

    doc.save("invoice.pdf");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded shadow-md">

        {/* ✅ Tailwind Proof Banner */}
        <div className="bg-green-500 text-white p-2 rounded text-center mb-6">
          ✅ Tailwind CSS applied via Vite (no CDN used)
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Invoice</h1>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {["Client Name", "Address", "Invoice Number", "Date"].map((label, idx) => {
            const field = ["name", "address", "invoiceNumber", "date"][idx];
            const type = field === "date" ? "date" : "text";
            return (
              <div key={field}>
                <label className="text-sm font-medium">{label}</label>
                <input
                  type={type}
                  className="border p-2 w-full rounded"
                  placeholder={label}
                  {...register(field, { required: `${label} is required` })}
                  value={client[field]}
                  onChange={(e) => setClient({ ...client, [field]: e.target.value })}
                />
                {errors[field] && <p className="text-red-500 text-sm">{errors[field].message}</p>}
              </div>
            );
          })}
        </div>

        <table className="w-full mb-6 border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Description</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Rate</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-t">
                <td>
                  <input
                    className="border p-1 w-full rounded"
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="border p-1 w-full rounded"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="border p-1 w-full rounded"
                    value={item.rate}
                    onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                  />
                </td>
                <td className="text-center">₹{item.amount.toFixed(2)}</td>
                <td>
                  <button
                    className="text-red-500"
                    type="button"
                    onClick={() => removeItem(idx)}
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          onClick={addItem}
        >
          ➕ Add Item
        </button>

        <div className="text-right space-y-2 mt-4">
          <p>Subtotal: ₹{totals.subtotal.toFixed(2)}</p>
          <p>Tax (18%): ₹{totals.tax.toFixed(2)}</p>
          <p className="font-bold text-lg">Total: ₹{totals.total.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          ✅ Validate & Preview
        </button>

        <button
          type="button"
          className="bg-purple-600 text-white px-6 py-2 rounded"
          onClick={generatePDF}
        >
          🧾 Export as PDF
        </button>
      </div>
    </form>
  );
}

export default App;