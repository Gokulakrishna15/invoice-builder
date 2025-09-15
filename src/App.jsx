import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
    const invoice = document.getElementById("invoice-preview");
    html2canvas(invoice, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("invoice.pdf");
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <div id="invoice-preview" className="bg-white p-6 rounded shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Invoice</h1>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium">Client Name</label>
            <input
              className="border p-2 w-full rounded"
              placeholder="Client Name"
              {...register("clientName", { required: "Client name is required" })}
              value={client.name}
              onChange={(e) => setClient({ ...client, name: e.target.value })}
            />
            {errors.clientName && <p className="text-red-500 text-sm">{errors.clientName.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Address</label>
            <input
              className="border p-2 w-full rounded"
              placeholder="Address"
              {...register("address", { required: "Address is required" })}
              value={client.address}
              onChange={(e) => setClient({ ...client, address: e.target.value })}
            />
            {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Invoice Number</label>
            <input
              className="border p-2 w-full rounded"
              placeholder="Invoice Number"
              {...register("invoiceNumber", { required: "Invoice number is required" })}
              value={client.invoiceNumber}
              onChange={(e) => setClient({ ...client, invoiceNumber: e.target.value })}
            />
            {errors.invoiceNumber && <p className="text-red-500 text-sm">{errors.invoiceNumber.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Date</label>
            <input
              className="border p-2 w-full rounded"
              type="date"
              {...register("date", { required: "Date is required" })}
              value={client.date}
              onChange={(e) => setClient({ ...client, date: e.target.value })}
            />
            {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
          </div>
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
                    onChange={(e) =>
                      handleItemChange(idx, "description", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="border p-1 w-full rounded"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(idx, "quantity", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="border p-1 w-full rounded"
                    value={item.rate}
                    onChange={(e) =>
                      handleItemChange(idx, "rate", e.target.value)
                    }
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