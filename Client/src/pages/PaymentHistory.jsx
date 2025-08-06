import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PaymentHistory = ({ orderId }) => {
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await axios.get(`/api/payment-history/${orderId}`);
                setPayments(response.data.payments);
            } catch (error) {
                console.error(error);
            }
        };

        fetchPayments();
    }, [orderId]);

    return (
        <div>
            <h3>Payment History</h3>
            <table>
                <thead>
                    <tr>
                        <th>Payment ID</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((payment) => (
                        <tr key={payment._id}>
                            <td>{payment._id}</td>
                            <td>{payment.amount}</td>
                            <td>{payment.paymentMethod}</td>
                            <td>{new Date(payment.paymentDate).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PaymentHistory;