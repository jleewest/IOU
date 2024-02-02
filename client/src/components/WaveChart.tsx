import { useTransactionContext } from '../index';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export type DatedTransaction = {
  date: string;
  amount: number;
};

const WaveChart = () => {
  const { transactions } = useTransactionContext();
  const [groupedTransactions, setGroupedTransactions] = useState<
    DatedTransaction[][]
  >([]);
  const [pendingExpense, setPendingExpense] = useState<DatedTransaction[]>();
  const [pendingPayment, setPendingPayment] = useState<DatedTransaction[]>();
  const [awaitedPending, setAwaitedPending] = useState<DatedTransaction[]>();
  const [received, setReceived] = useState<DatedTransaction[]>();
  const [confirmedActorExpenses, setConfirmedActorExpenses] =
    useState<DatedTransaction[]>();
  const [confirmedActeeExpenses, setConfirmedActeeExpenses] =
    useState<DatedTransaction[]>();

  const [netDataDate, setNetDataDate] = useState<string[]>([]);
  const [netDataAmount, setNetDataAmount] = useState<number[]>([]);
  const { user } = useUser();

  // To each transaction: set date without time, amount, and renderType
  useEffect(() => {
    if (transactions && user) {
      setPendingExpense(
        transactions.pending.expense.map((transaction) => ({
          date: new Date(transaction.date).toLocaleDateString(),
          amount: transaction.amount,
        }))
      );
      setPendingPayment(
        transactions.pending.payment.map((transaction) => ({
          date: new Date(transaction.date).toLocaleDateString(),
          amount: -transaction.amount,
        }))
      );
      if (transactions) {
        setAwaitedPending(
          transactions.active.expense.awaitedPendingExpenseSentToOther.map(
            (transaction) => ({
              date: new Date(transaction.date).toLocaleDateString(),
              amount: transaction.amount,
            })
          )
        );
        setConfirmedActeeExpenses(
          transactions.active.expense.confirmedExpenses
            .filter((transaction) => {
              transaction.transactee === user.id &&
                transaction.transactor !== user.id;
            })
            .map((transaction) => ({
              date: new Date(transaction.date).toLocaleDateString(),
              amount: -transaction.amount,
            }))
        );
        setConfirmedActorExpenses(
          transactions.active.expense.confirmedExpenses
            .filter((transaction) => {
              transaction.transactee !== user.id &&
                transaction.transactor === user.id;
            })
            .map((transaction) => ({
              date: new Date(transaction.date).toLocaleDateString(),
              amount: transaction.amount,
            }))
        );
        setReceived(
          transactions.active.payment.received.map((transaction) => ({
            date: new Date(transaction.date).toLocaleDateString(),
            amount: -transaction.amount,
          }))
        );
      }
    }
  }, [transactions, user]);

  ////Group transactions by day
  useEffect(() => {
    if (
      pendingExpense &&
      pendingPayment &&
      confirmedActeeExpenses &&
      confirmedActorExpenses &&
      awaitedPending &&
      received
    ) {
      const allTransactions = [
        ...pendingExpense,
        ...pendingPayment,
        ...confirmedActeeExpenses,
        ...confirmedActorExpenses,
        ...awaitedPending,
        ...received,
      ];

      //sort transactions by date
      const sortedTransactions = allTransactions.sort((a, b) =>
        a.date.localeCompare(b.date)
      );

      //create array of date arrays containing respective transactions
      const groupedTransactions: DatedTransaction[][] = [];
      sortedTransactions.forEach((transaction) => {
        const transactionDate = new Date(transaction.date).toLocaleDateString();
        console.log(transactionDate);
        let existingArray = groupedTransactions.find(
          (existingDateGroup) =>
            new Date(existingDateGroup[0].date).toLocaleDateString() ===
            transactionDate
        );
        if (!existingArray) {
          existingArray = [];
          groupedTransactions.push(existingArray);
        }
        existingArray.push(transaction);
      });
      setGroupedTransactions(groupedTransactions);
    }
  }, [
    pendingExpense,
    pendingPayment,
    confirmedActeeExpenses,
    confirmedActorExpenses,
    awaitedPending,
    received,
  ]);

  //reduce each date-array to net amount
  useEffect(() => {
    if (groupedTransactions) {
      const calculateDailyNetBalance = () => {
        let cumulativeBalance = 0;
        const dailyBalance = groupedTransactions.map((dateArray) => {
          const date = dateArray[0].date;
          cumulativeBalance += dateArray.reduce(
            (acc, transaction) => acc + transaction.amount,
            0
          );
          return { date: date, amount: cumulativeBalance };
        });

        setNetDataAmount(dailyBalance.map((balance) => balance.amount));
        setNetDataDate(dailyBalance.map((balance) => balance.date));
      };
      calculateDailyNetBalance();
    }
  }, [groupedTransactions]);

  const data = {
    labels: netDataDate,
    datasets: [
      {
        data: netDataAmount,
        backgroundColor: 'green',
        pointBorderColor: 'green',
      },
    ],
  };

  const options = {
    plugins: {
      //legend: true,
    },
    //scales: {},
  };

  return (
    <div
      className='WaveChart'
      style={{ border: '2px solid var(--dark-accent-color)' }}
    >
      <Line data={data} options={options}></Line>
    </div>
  );
};

export default WaveChart;
