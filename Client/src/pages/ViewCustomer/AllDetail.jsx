import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const AllDetail = () => {
  const { id } = useParams();
  const [payments, setPayments] = useState([]);
  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderAndPayments = async () => {
      try {
        const orderRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/order/${id}`
        );
        setOrder(orderRes.data.order);

        if (orderRes.data.order?.orderItems?.[0]?.address) {
          setCustomer(orderRes.data.order.orderItems[0].address);
        }

        const paymentsRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/payments/${id}`
        );
        setPayments(paymentsRes.data.payments || []);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchOrderAndPayments();
  }, [id]);

  const handlePaymentSuccess = async (newPayment) => {
    try {
      setPayments([...payments, newPayment]);
      const orderRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/order/${id}`
      );
      setOrder(orderRes.data.order);
    } catch (err) {
      console.error("Error updating order after payment:", err);
    }
  };

  if (loading) {
    return <div className='container mx-auto px-4 py-8'>Loading...</div>;
  }

  if (!order) {
    return <div className='container mx-auto px-4 py-8'>Order not found</div>;
  }

  const { dueAmount, createdAt, orderItems } = order;
  const firstOrderDate = new Date(createdAt).toLocaleDateString();
  const lastOrderDate = new Date(createdAt).toLocaleDateString();

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Customer Details Section */}
      <div className='bg-white p-6 rounded-lg shadow-md mb-8'>
        <h1 className='text-2xl font-bold text-gray-800 mb-6'>
          Customer Basic Detail
        </h1>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h3 className='text-sm font-medium text-gray-500'>Name</h3>
            <p className='mt-1 text-lg font-semibold text-gray-900'>
              {order.orderItems[0].discountName?.firmName || "N/A"}
            </p>
          </div>

          <div>
            <h3 className='text-sm font-medium text-gray-500'>Mobile</h3>
            <p className='mt-1 text-lg font-semibold text-gray-900'>
              {order.orderItems[0].discountName?.mobile1 || "N/A"}
            </p>
          </div>

          <div>
            <h3 className='text-sm font-medium text-gray-500'>Colony</h3>
            <p className='mt-1 text-lg font-semibold text-gray-900'>
              {order.orderItems[0].discountName?.city || "N/A"},{" "}
              {order.orderItems[0].discountName?.state || "N/A"}
            </p>
          </div>

          <div>
            <h3 className='text-sm font-medium text-gray-500'>Address</h3>
            <p className='mt-1 text-lg font-semibold text-gray-900'>
              {order.orderItems[0].discountName?.address || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Order Details Section */}
      <div className='bg-white p-6 rounded-lg shadow-md mb-8'>
        <h1 className='text-2xl font-bold text-gray-800 mb-6'>Order Details</h1>

        {orderItems.map((item, index) => (
          <div key={item.id || index} className='mb-6 border-b pb-4'>
            <div className='flex items-start'>
              <img
                src={item.productImage}
                alt={item.productName}
                className='w-20 h-20 object-cover rounded mr-4'
              />
              <div>
                <h3 className='text-lg font-semibold'>{item.productName}</h3>
                <p className='text-gray-600'>
                  Original Price: ₹{item.price?.toLocaleString() || "N/A"}
                </p>
                <p className='text-gray-600'>
                  Discount: {item.discountPercentage}% (₹
                  {(item.price - item.priceAfterDiscount)?.toLocaleString() ||
                    "N/A"}
                  )
                </p>
                <p className='text-green-600 font-medium'>
                  Final Price: ₹
                  {item.priceAfterDiscount?.toLocaleString() || "N/A"}
                </p>
                <p className='text-gray-600'>Quantity: {item.quantity}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Due Amount Section */}
      <div className='bg-white p-6 rounded-lg shadow-md mb-8'>
        <h1 className='text-2xl font-bold text-gray-800 mb-6'>
          Total Due Amount
        </h1>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div>
            <h3 className='text-sm font-medium text-gray-500'>
              Alternate Mobile Number
            </h3>
            <p className='mt-1 text-lg font-semibold text-gray-900'>
              {order.orderItems[0].discountName?.mobile2 || "N/A"}
            </p>
          </div>

          <div>
            <h3 className='text-sm font-medium text-gray-500'>Total Order</h3>
            <p className='mt-1 text-lg font-semibold text-gray-900'>
              {orderItems.length}
            </p>
          </div>

          <div>
            <h3 className='text-sm font-medium text-gray-500'>Last Order</h3>
            <p className='mt-1 text-lg font-semibold text-gray-900'>
              {lastOrderDate}
            </p>
          </div>

          <div>
            <h3 className='text-sm font-medium text-gray-500'>
              First Order Date
            </h3>
            <p className='mt-1 text-lg font-semibold text-gray-900'>
              {firstOrderDate}
            </p>
          </div>

          <div className='md:col-span-2'>
            <h3 className='text-sm font-medium text-gray-500'>Due Amount</h3>
            <p className='mt-1 text-3xl font-bold text-red-600'>
              ₹{dueAmount?.toLocaleString() || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Payments History */}
      <div className='bg-white p-6 rounded-lg shadow-md overflow-x-auto'>
        <h2 className='text-xl font-semibold mb-4'>Payment History</h2>

        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Payment Mode
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Amount
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Cheque Number
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Receiving Date
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Remark
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <tr key={payment._id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {payment.paymentMode || "N/A"}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    ₹{payment.amount?.toLocaleString() || 0}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {payment.chequeNumber && payment.chequeNumber !== ""
                      ? payment.chequeNumber
                      : "N/A"}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {payment.receivingDate
                      ? new Date(payment.receivingDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {payment.remark || "-"}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {payment.status || "Unknown"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan='6'
                  className='px-6 py-4 text-center text-sm text-gray-500'
                >
                  No payments recorded yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllDetail;
