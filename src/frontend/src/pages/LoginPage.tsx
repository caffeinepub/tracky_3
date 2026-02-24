import { useState, useEffect } from 'react';
import { useOTPAuth } from '../hooks/useOTPAuth';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, Smartphone, CheckCircle2 } from 'lucide-react';
import { useSendOTP, useVerifyOTP, useSignup } from '../hooks/useQueries';

type AuthStep = 'mobile' | 'otp' | 'signup';

export default function LoginPage() {
  const { isAuthenticated, login } = useOTPAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<AuthStep>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const sendOTPMutation = useSendOTP();
  const verifyOTPMutation = useVerifyOTP();
  const signupMutation = useSignup();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' });
    }
  }, [isAuthenticated, navigate]);

  const handleSendOtp = async () => {
    setError(null);
    setSuccessMessage(null);
    
    if (mobileNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      await sendOTPMutation.mutateAsync(mobileNumber);
      setSuccessMessage('OTP sent successfully!');
      setStep('otp');
    } catch (err: any) {
      console.error('OTP request error:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setSuccessMessage(null);
    
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      const result = await verifyOTPMutation.mutateAsync({ mobileNumber, code: otp });
      
      if (!result.authenticated) {
        setError('Invalid OTP. Please try again.');
        return;
      }

      // Log the user in with their mobile number
      login(mobileNumber);
      
      setSuccessMessage('OTP verified successfully!');
      
      // Check if this is a new user
      if (result.isNewUser) {
        // New user - show signup form
        setTimeout(() => {
          setStep('signup');
        }, 500);
      } else {
        // Existing user - redirect to dashboard
        setTimeout(() => {
          navigate({ to: '/dashboard' });
        }, 500);
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Failed to verify OTP. Please try again.');
    }
  };

  const handleCreateAccount = async () => {
    setError(null);
    setSuccessMessage(null);
    
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    try {
      await signupMutation.mutateAsync({
        name: fullName,
        mobileNumber: mobileNumber,
      });
      
      setSuccessMessage('Account created successfully!');
      
      // Small delay to show success message before navigation
      setTimeout(() => {
        navigate({ to: '/dashboard' });
      }, 500);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    }
  };

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(value);
  };

  const isLoading = sendOTPMutation.isPending || verifyOTPMutation.isPending || signupMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <img 
            src="/assets/generated/tracky-logo.dim_256x256.png" 
            alt="Tracky Logo" 
            className="w-24 h-24 mx-auto mb-4 rounded-2xl shadow-lg"
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Tracky</h1>
          <p className="text-gray-600 text-lg">Track your syllabus smartly</p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-blue-100">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold">
              {step === 'mobile' && 'Login'}
              {step === 'otp' && 'Verify OTP'}
              {step === 'signup' && 'Create Account'}
            </CardTitle>
            <CardDescription className="text-base">
              {step === 'mobile' && 'Enter your mobile number to get started'}
              {step === 'otp' && `Enter the 6-digit OTP sent to ${mobileNumber}`}
              {step === 'signup' && 'Complete your profile to continue'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {successMessage && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            {/* Mobile Number Step */}
            {step === 'mobile' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-base font-medium">
                    Mobile Number
                  </Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={mobileNumber}
                      onChange={handleMobileNumberChange}
                      className="pl-10 text-lg h-12"
                      maxLength={10}
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    {mobileNumber.length}/10 digits
                  </p>
                </div>

                <Button 
                  onClick={handleSendOtp} 
                  disabled={isLoading || mobileNumber.length !== 10}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-medium"
                  size="lg"
                >
                  {sendOTPMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </div>
            )}

            {/* OTP Verification Step */}
            {step === 'otp' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="otp" className="text-base font-medium">
                    Enter OTP
                  </Label>
                  <div className="flex justify-center py-2">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                      disabled={isLoading}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                        <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                        <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                        <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                        <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
                        <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-sm text-center text-gray-500">
                    For testing, use OTP: <span className="font-semibold">123456</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleVerifyOtp} 
                    disabled={isLoading || otp.length !== 6}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-medium"
                    size="lg"
                  >
                    {verifyOTPMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Login'
                    )}
                  </Button>

                  <Button 
                    onClick={() => {
                      setStep('mobile');
                      setOtp('');
                      setError(null);
                      setSuccessMessage(null);
                    }} 
                    variant="ghost"
                    className="w-full h-11"
                    disabled={isLoading}
                  >
                    Change Mobile Number
                  </Button>
                </div>
              </div>
            )}

            {/* Signup Step */}
            {step === 'signup' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-base font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                    className="h-12 text-base"
                    autoFocus
                  />
                </div>

                <Button 
                  onClick={handleCreateAccount} 
                  disabled={isLoading || !fullName.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-medium"
                  size="lg"
                >
                  {signupMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
