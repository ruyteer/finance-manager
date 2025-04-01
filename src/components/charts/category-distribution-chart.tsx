"use client"

import { useMemo } from "react"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import type { Transaction } from "@/lib/types"

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend)

interface CategoryDistributionChartProps {
  transactions: Transaction[]
}

export default function CategoryDistributionChart({ transactions }: CategoryDistributionChartProps) {
  // Process data for chart
  const chartData = useMemo(() => {
    // Group transactions by category
    const categoryMap = new Map<string, number>()

    transactions.forEach((transaction) => {
      const category = transaction.category || "Outros"
      const currentAmount = categoryMap.get(category) || 0
      categoryMap.set(category, currentAmount + transaction.amount)
    })

    // Sort categories by amount (descending)
    const sortedCategories = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1])

    // Get top 5 categories and group the rest as "Outros"
    let categories: string[] = []
    let amounts: number[] = []

    if (sortedCategories.length <= 5) {
      categories = sortedCategories.map(([category]) => category)
      amounts = sortedCategories.map(([, amount]) => amount)
    } else {
      const top5 = sortedCategories.slice(0, 5)
      const others = sortedCategories.slice(5)

      categories = [...top5.map(([category]) => category), "Outros"]
      amounts = [...top5.map(([, amount]) => amount), others.reduce((sum, [, amount]) => sum + amount, 0)]
    }

    // Generate colors
    const backgroundColors = [
      "rgba(54, 162, 235, 0.6)",
      "rgba(255, 99, 132, 0.6)",
      "rgba(255, 206, 86, 0.6)",
      "rgba(75, 192, 192, 0.6)",
      "rgba(153, 102, 255, 0.6)",
      "rgba(255, 159, 64, 0.6)",
    ]

    const borderColors = [
      "rgba(54, 162, 235, 1)",
      "rgba(255, 99, 132, 1)",
      "rgba(255, 206, 86, 1)",
      "rgba(75, 192, 192, 1)",
      "rgba(153, 102, 255, 1)",
      "rgba(255, 159, 64, 1)",
    ]

    return {
      labels: categories,
      data: amounts,
      backgroundColors: backgroundColors.slice(0, categories.length),
      borderColors: borderColors.slice(0, categories.length),
    }
  }, [transactions])

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "rgba(255, 255, 255, 0.7)",
          boxWidth: 15,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || ""
            const value = context.raw
            const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0)
            const percentage = Math.round((value / total) * 100)
            return `${label}: ${new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(value)} (${percentage}%)`
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
        data: chartData.data,
        backgroundColor: chartData.backgroundColors,
        borderColor: chartData.borderColors,
        borderWidth: 1,
      },
    ],
  }

  // If no data, show message
  if (transactions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-400">Sem dados para exibir</p>
      </div>
    )
  }

  return <Pie options={options} data={data} />
}

