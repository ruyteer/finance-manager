"use client"

import { useMemo } from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import type { Transaction } from "@/lib/types"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface IncomeExpenseChartProps {
  transactions: Transaction[]
}

export default function IncomeExpenseChart({ transactions }: IncomeExpenseChartProps) {
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
    const incomeData = months.map((month) => {
      const monthTransactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date)
        return transactionDate.getMonth() === month.getMonth() && transactionDate.getFullYear() === month.getFullYear()
      })

      return monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    })

    const expenseData = months.map((month) => {
      const monthTransactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date)
        return transactionDate.getMonth() === month.getMonth() && transactionDate.getFullYear() === month.getFullYear()
      })

      return monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
    })

    // Format month labels
    const labels = months.map((month) => {
      return month.toLocaleDateString("pt-BR", { month: "short" })
    })

    return {
      labels,
      incomeData,
      expenseData,
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
        backgroundColor: "rgba(34, 197, 94, 0.6)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      },
      {
        label: "Despesas",
        data: chartData.expenseData,
        backgroundColor: "rgba(239, 68, 68, 0.6)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
      },
    ],
  }

  return <Bar options={options} data={data} />
}

