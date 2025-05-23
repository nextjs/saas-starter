'use client';

import { useActionState } from 'react';
import { use } from 'react';
import { resetPassword } from '../../actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, EyeOff, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Props { 
  params: { 
    token: string 
  } 
}

export default function ResetPasswordPage({ params }: Props) {
  // Use React.use() to unwrap the params object as required by Next.js
  const unwrappedParams = use(params);
  const { token } = unwrappedParams;
  const [state, formAction, pending] = useActionState(resetPassword, { error: '' });
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState<boolean>(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();
  
  // Validate token format
  useEffect(() => {
    if (!token || typeof token !== 'string' || token.length < 10) {
      setTokenExpired(true);
    }
  }, [token]);

  useEffect(() => {
    if (state.error && (
      state.error.includes('invalid') || 
      state.error.includes('expired') || 
      state.error.includes('used') ||
      state.error.includes('Format tokenu')
    )) {
      setTokenExpired(true);
    }
  }, [state.error]);

  // Check if passwords match
  useEffect(() => {
    if (confirmPassword) {
      setPasswordMatch(password === confirmPassword);
    } else {
      setPasswordMatch(true);
    }
  }, [password, confirmPassword]);
  
  // Check password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    // Contains number
    if (/\d/.test(password)) strength += 1;
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [password]);
  
  // Render strength bar
  const renderStrengthBar = () => {
    if (!password) return null;
    
    const getColor = () => {
      if (passwordStrength <= 2) return 'bg-red-500';
      if (passwordStrength <= 3) return 'bg-yellow-500';
      return 'bg-green-500';
    };
    
    const getLabel = () => {
      if (passwordStrength <= 2) return 'Weak';
      if (passwordStrength <= 3) return 'Medium';
      return 'Strong';
    };
    
    return (
      <div className="mt-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Password Strength:</span>
          <span className="text-xs font-medium" style={{ color: passwordStrength <= 2 ? 'red' : passwordStrength <= 3 ? 'orange' : 'green' }}>
            {getLabel()}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getColor()}`} 
            style={{ width: `${(passwordStrength / 5) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Password Reset</h2>
        
        {state.error && (
          <div className="flex items-start space-x-2 text-red-600 text-sm mb-6 p-3 bg-red-50 rounded-lg border border-red-100">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        {tokenExpired ? (
          <div className="mt-4 text-center">
            <p className="text-gray-600 mb-4">You need a new password reset link.</p>
            <Link 
              href="/forgot-password" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Go to password reset form
            </Link>
          </div>
        ) : (
        <form className="space-y-4" action={formAction}>
          <input type="hidden" name="token" value={token} />
          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                name="password" 
                type={passwordVisible ? "text" : "password"} 
                required 
                className="mt-1 block w-full pr-10" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {renderStrengthBar()}
          </div>
          <div>
            <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm new password</Label>
            <div className="relative">
              <Input 
                id="confirmPassword" 
                name="confirmPassword" 
                type={confirmPasswordVisible ? "text" : "password"} 
                required 
                className={`mt-1 block w-full pr-10 ${confirmPassword && !passwordMatch ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              >
                {confirmPasswordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {confirmPassword && !passwordMatch && (
              <p className="text-red-500 text-xs mt-1">The passwords are not identical</p>
            )}
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <h3 className="text-sm font-medium text-blue-800 mb-1">Password Requirements:</h3>
            <ul className="text-xs text-blue-700 space-y-1 pl-5 list-disc">
              <li>Minimum 8 characters</li>
              <li>Numbers recommended</li>
              <li>Upper and lower case letters recommended</li>
              <li>Special characters recommended (!@#$%^&*)</li>
            </ul>
          </div>
          <div>
            <Button 
              type="submit" 
              className="w-full flex justify-center items-center bg-gradient-to-r from-blue-600 to-teal-500 text-white hover:from-blue-700 hover:to-teal-600" 
              disabled={pending || !password || !confirmPassword || !passwordMatch || passwordStrength < 2 || password !== confirmPassword}
            >
              {pending ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Change password'}
            </Button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
} 