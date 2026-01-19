import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { calculatePrice } from '@/hooks/useBookingSearch';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PriceBreakdownProps {
  baseRate: number;
  hours: number;
  className?: string;
  showDeposit?: boolean;
}

export function PriceBreakdown({ baseRate, hours, className, showDeposit = true }: PriceBreakdownProps) {
  const { subtotal, discount, taxes, serviceFee, total, deposit } = calculatePrice(baseRate, hours);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            ₹{baseRate.toLocaleString('en-IN')} × {hours} hrs
          </span>
          <span>₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        
        {discount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex justify-between text-green-600"
          >
            <span>Duration discount</span>
            <span>-₹{discount.toLocaleString('en-IN')}</span>
          </motion.div>
        )}
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Taxes (18% GST)</span>
          <span>₹{taxes.toLocaleString('en-IN')}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Service fee</span>
          <span>₹{serviceFee.toLocaleString('en-IN')}</span>
        </div>
      </div>
      
      <div className="border-t border-border pt-3">
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <motion.span
            key={total}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="price-pulse"
          >
            ₹{total.toLocaleString('en-IN')}
          </motion.span>
        </div>
      </div>
      
      {showDeposit && (
        <div className="bg-accent/10 rounded-xl p-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-accent">Pay now</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px]">
                  <p>Deposit secures your booking. Remainder due at check-in or auto-charged 2 hours before start.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <motion.span
              key={deposit}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className="font-bold text-lg text-accent"
            >
              ₹{deposit.toLocaleString('en-IN')}
            </motion.span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            30% deposit (min ₹500) • Remainder: ₹{(total - deposit).toLocaleString('en-IN')}
          </p>
        </div>
      )}
    </div>
  );
}
