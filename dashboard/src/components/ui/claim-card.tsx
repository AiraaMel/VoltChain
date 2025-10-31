import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"

interface ClaimCardProps {
  amount?: number;
}

export function ClaimCard({ amount = 1247.85 }: ClaimCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-green-800 dark:text-green-300">
          Available to Claim
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold text-green-900 dark:text-green-200">
          ${amount.toLocaleString()} USDC
        </div>
        <p className="text-sm text-green-700 dark:text-green-400">
          Your accumulated earnings ready to withdraw
        </p>
        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
          Claim Now
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
