import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const calculateStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
    if (/\d/.test(pwd)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 10;
    return Math.min(strength, 100);
  };

  const strength = calculateStrength(password);
  
  const getStrengthLabel = (value: number): string => {
    if (value < 30) return "Weak";
    if (value < 60) return "Fair";
    if (value < 80) return "Good";
    return "Strong";
  };

  const getStrengthColor = (value: number): string => {
    if (value < 30) return "text-destructive";
    if (value < 60) return "text-orange-500";
    if (value < 80) return "text-yellow-500";
    return "text-green-500";
  };

  if (!password) return null;

  return (
    <div className="space-y-2">
      <Progress value={strength} className="h-2" />
      <p className={cn("text-sm font-medium", getStrengthColor(strength))}>
        Password strength: {getStrengthLabel(strength)}
      </p>
      <ul className="text-xs text-muted-foreground space-y-1">
        <li className={password.length >= 8 ? "text-green-600" : ""}>
          • At least 8 characters
        </li>
        <li className={/[a-z]/.test(password) && /[A-Z]/.test(password) ? "text-green-600" : ""}>
          • Uppercase and lowercase letters
        </li>
        <li className={/\d/.test(password) ? "text-green-600" : ""}>
          • At least one number
        </li>
        <li className={/[^a-zA-Z0-9]/.test(password) ? "text-green-600" : ""}>
          • At least one special character
        </li>
      </ul>
    </div>
  );
};
