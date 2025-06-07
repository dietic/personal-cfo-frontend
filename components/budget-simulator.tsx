"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator } from "lucide-react"

export function BudgetSimulator() {
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [simulationResult, setSimulationResult] = useState<null | {
    affordable: boolean
    impact: string
    newBalance: number
    advice: string
  }>(null)

  // Mock data
  const categories = ["Food", "Shopping", "Transportation", "Entertainment", "Groceries"]
  const currentBalance = 3450.18
  const monthlyIncome = 5000
  const monthlyExpenses = 3800

  const handleSimulate = () => {
    const spendAmount = Number.parseFloat(amount)
    if (isNaN(spendAmount) || !category) return

    const remainingBalance = currentBalance - spendAmount
    const affordable = remainingBalance > 500 // Arbitrary threshold
    const impact = ((spendAmount / monthlyIncome) * 100).toFixed(1)

    let advice = ""
    if (affordable) {
      advice = "This purchase fits within your budget."
    } else if (remainingBalance > 0) {
      advice = "This purchase will leave your balance low. Consider delaying it."
    } else {
      advice = "This purchase will put you in the negative. Not recommended."
    }

    setSimulationResult({
      affordable,
      impact: `${impact}% of monthly income`,
      newBalance: remainingBalance,
      advice,
    })
  }

  const resetSimulation = () => {
    setAmount("")
    setCategory("")
    setSimulationResult(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Budget Simulator
        </CardTitle>
        <CardDescription>Simulate a purchase to see if you can afford it</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Current Balance</Label>
              <p className="font-medium">${currentBalance.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Monthly Cashflow</Label>
              <p className="font-medium">${(monthlyIncome - monthlyExpenses).toLocaleString()}</p>
            </div>
          </div>

          {simulationResult && (
            <div
              className={`p-4 rounded-md ${
                simulationResult.affordable
                  ? "bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-300"
                  : "bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-300"
              }`}
            >
              <h3
                className={`font-medium ${
                  simulationResult.affordable ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                }`}
              >
                {simulationResult.affordable ? "You can afford this!" : "This might be a stretch"}
              </h3>
              <div className="mt-2 space-y-1 text-sm">
                <p>
                  New balance: <span className="font-medium">${simulationResult.newBalance.toLocaleString()}</span>
                </p>
                <p>
                  Impact: <span className="font-medium">{simulationResult.impact}</span>
                </p>
                <p className="mt-2">{simulationResult.advice}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {simulationResult ? (
          <>
            <Button variant="outline" onClick={resetSimulation}>
              Reset
            </Button>
            <Button disabled={!simulationResult.affordable}>
              {simulationResult.affordable ? "Proceed with Purchase" : "Not Recommended"}
            </Button>
          </>
        ) : (
          <Button onClick={handleSimulate} className="w-full">
            Simulate Purchase
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
