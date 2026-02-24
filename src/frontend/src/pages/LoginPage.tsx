import { useState, useEffect } from 'react';
import { useOTPAuth } from '../hooks/useOTPAuth';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, Smartphone } from 'lucide-react';
import { useRequestOtp, useVerifyOtp, useIsRegistered, useCreateProfile } from '../hooks/useQueries';

type AuthStep = 'mobile' | 'otp' | 'signup';

export default function LoginPage() {
  const { isAuthenticated, login } = useOTPAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<AuthStep>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [classOrCourse, setClassOrCourse] = useState('');
  const [error, setError] = useState<string | null>(null);

  const requestOtpMutation = useRequestOtp();
  const verifyOtpMutation = useVerifyOtp();
  const isRegisteredMutation = useIsRegistered();
  const createProfileMutation = useCreateProfile();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' });
    }
  }, [isAuthenticated, navigate]);

  const handleSendOtp = async () => {
    setError(null);
    
    if (mobileNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      await requestOtpMutation.mutateAsync(mobileNumber);
      setStep('otp');
    } catch (err: any) {
      console.error('OTP request error:', err);
      setError('Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      const verified = await verifyOtpMutation.mutateAsync({ mobileNumber, otp });
      
      if (!verified) {
        setError('Invalid OTP. Please try again.');
        return;
      }

      // Check if user is registered
      const registered = await isRegisteredMutation.mutateAsync(mobileNumber);
      
      if (registered) {
        // User exists, log them in
        login(mobileNumber);
        navigate({ to: '/dashboard' });
      } else {
        // New user, show signup form
        setStep('signup');
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError('Failed to verify OTP. Please try again.');
    }
  };

  const handleCreateAccount = async () => {
    setError(null);
    
    if (!fullName.trim() || !classOrCourse.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await createProfileMutation.mutateAsync(mobileNumber);
      login(mobileNumber);
      navigate({ to: '/dashboard' });
    } catch (err: any) {
      console.error('Profile creation error:', err);
      setError('Failed to create account. Please try again.');
    }
  };

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(value);
  };

  const isLoading = requestOtpMutation.isPending || verifyOtpMutation.isPending || 
                    isRegisteredMutation.isPending || createProfileMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/assets/generated/tracky-logo.dim_256x256.png" 
            alt="Tracky Logo" 
            className="w-24 h-24 mx-auto mb-4 rounded-2xl shadow-lg"
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Tracky</h1>
          <p className="text-gray-600">Track your syllabus smartly</p>
        </div>

        <Card className="shadow-xl border-blue-100">
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === 'mobile' && 'Login'}
              {step === 'otp' && 'Verify OTP'}
              {step === 'signup' && 'Create Account'}
            </CardTitle>
            <CardDescription>
              {step === 'mobile' && 'Enter your mobile number to get started'}
              {step === 'otp' && `Enter the 6-digit OTP sent to ${mobileNumber}`}
              {step === 'signup' && 'Complete your profile to continue'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 'mobile' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={mobileNumber}
                      onChange={handleMobileNumberChange}
                      className="pl-10 text-lg"
                      maxLength={10}
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {mobileNumber.length}/10 digits
                  </p>
                </div>

                <Button 
                  onClick={handleSendOtp} 
                  disabled={isLoading || mobileNumber.length !== 10}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </>
            )}

            {step === 'otp' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                      disabled={isLoading}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-xs text-center text-gray-500">
                    For testing, use OTP: 1234
                  </p>
                </div>

                <Button 
                  onClick={handleVerifyOtp} 
                  disabled={isLoading || otp.length !== 6}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Login'
                  )}
                </Button>

                <Button 
                  onClick={() => setStep('mobile')} 
                  variant="ghost"
                  className="w-full"
                  disabled={isLoading}
                >
                  Change Mobile Number
                </Button>
              </>
            )}

            {step === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class">Class / Course</Label>
                  <Input
                    id="class"
                    type="text"
                    placeholder="e.g., Class 10, B.Tech CSE"
                    value={classOrCourse}
                    onChange={(e) => setClassOrCourse(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <Button 
                  onClick={handleCreateAccount} 
                  disabled={isLoading || !fullName.trim() || !classOrCourse.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
