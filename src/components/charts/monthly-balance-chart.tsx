"use client"

import { useMemo } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import type { Transaction } from "@/lib/types"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface MonthlyBalanceChartProps {
  transactions: Transaction[]
}

export default function MonthlyBalanceChart({ transactions }: MonthlyBalanceChartProps) {
  // Process data for chart
  const chartData = useMemo(() => {
    // Get current month and year
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    // Create array of last 6 months
    const months = []
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentYear, currentMonth - i, 1)
      months.push(month)
    }

    // Calculate income and expenses for each month
    const monthlyData = months.map((month) => {
      const monthTransactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date)
        return transactionDate.getMonth() === month.getMonth() && transactionDate.getFullYear() === month.getFullYear()
      })

      const income = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

      const expense = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

      return {
        month,
        income,
        expense,
        balance: income - expense,
      }
    })

    // Format month labels
    const labels = monthlyData.map((data) => {
      return data.month.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    })

    return {
      labels,
      incomeData: monthlyData.map((d) => d.income),
      expenseData: monthlyData.map((d) => d.expense),
      balanceData: monthlyData.map((d) => d.balance),
    }
  }, [transactions])

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
          callback: (value: any) =>
            new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
              maximumFractionDigits: 0,
            }).format(value),
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || ""
            if (label) {
              label += ": "
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(context.parsed.y)
            }
            return label
          },
        },
      },
    },
  }

  // Chart data
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Receitas",
        data: chartData.incomeData,
        borderColor: "rgba(34, 197, 94, 1)",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        tension: 0.3,
      },
      {
        label: "Despesas",
        data: chartData.expenseData,
        borderColor: "rgba(239, 68, 68, 1)",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        tension: 0.3,
      },
      {
        label: "Balanço",
        data: chartData.balanceData,
        borderColor: "rgba(6, 182, 212, 1)",
        backgroundColor: "rgba(6, 182, 212, 0.2)",
        tension: 0.3,
      },
    ],
  }

  return <Line options={options} data={data} />
}

