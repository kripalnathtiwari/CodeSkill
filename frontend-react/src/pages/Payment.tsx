import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CreditCard, ShieldCheck, Lock, CheckCircle2, Building, Smartphone, ChevronRight, Loader2, Tag, AlertCircle } from "lucide-react";
import { getCourseById } from "../data/coursesData";
import { motion, AnimatePresence } from "framer-motion";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const { newEnrollment } = location.state || {};
  const course = getCourseById(newEnrollment?.courseId || "c-1");
  
  // Parse base price
  const basePriceStr = course?.price || "₹3,999";
  const basePriceNum = parseInt(basePriceStr.replace(/[^0-9]/g, "")) || 3999;

  const [paymentMethod, setPaymentMethod] = useState("card"); // card, upi, netbanking
  
  // Checkout states
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Validations & Form
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState(newEnrollment?.fullName || "");
  const [errors, setErrors] = useState<any>({});
  
  // Promo Code
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  // Bank Selection
  const [selectedBank, setSelectedBank] = useState("");

  // OTP
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (!newEnrollment) {
      navigate("/courses-training");
    }
  }, [newEnrollment, navigate]);

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === "CODESKILL50") {
      setDiscount(500);
      setPromoMessage("₹500 discount applied successfully!");
    } else if (promoCode.toUpperCase() === "WELCOME") {
      setDiscount(200);
      setPromoMessage("₹200 discount applied!");
    } else {
      setDiscount(0);
      setPromoMessage("Invalid or expired promo code.");
    }
  };

  const validateCard = () => {
    const newErrors: any = {};
    if (cardNumber.replace(/\s/g, "").length < 16) {
      newErrors.card = "Invalid card number.";
    }
    if (!expiry.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) {
      newErrors.expiry = "Invalid expiry (MM/YY).";
    }
    if (cvv.length < 3) {
      newErrors.cvv = "Invalid CVV.";
    }
    if (!name.trim()) {
      newErrors.name = "Name is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnrollment) return;

    if (paymentMethod === "card" && !validateCard()) return;
    if (paymentMethod === "netbanking" && !selectedBank) {
      setErrors({ bank: "Please select a bank." });
      return;
    }

    setErrors({});
    setIsProcessing(true);

    // Simulate connecting to bank
    setTimeout(() => {
      setIsProcessing(false);
      setShowOTP(true); // Always show OTP screen for realism
    }, 2000);
  };

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;

    setIsProcessing(true);

    // Simulate verifying OTP
    setTimeout(() => {
      setIsProcessing(false);
      setShowOTP(false);
      setIsSuccess(true);
      
      // Finalize Enrollment
      const existingStr = localStorage.getItem("enrolledCourses");
      let enrollments = [];
      if (existingStr) {
        try {
          enrollments = JSON.parse(existingStr);
        } catch (e) {}
      }
      
      const existingIndex = enrollments.findIndex((e: any) => e.courseId === newEnrollment.courseId && e.email?.toLowerCase() === newEnrollment.email?.toLowerCase());
      if (existingIndex > -1) {
        enrollments[existingIndex] = { ...enrollments[existingIndex], ...newEnrollment, status: "PAID" };
      } else {
        enrollments.push({ ...newEnrollment, status: "PAID" });
      }
      localStorage.setItem("enrolledCourses", JSON.stringify(enrollments));

      // Redirect to Dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 2500);
      
    }, 2000);
  };

  // Format Card Number
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 16) val = val.slice(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
    setCardNumber(formatted);
    if (errors.card) setErrors({ ...errors, card: null });
  };

  // Format Expiry
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length >= 2) {
      val = val.slice(0, 2) + "/" + val.slice(2, 4);
    }
    setExpiry(val);
    if (errors.expiry) setErrors({ ...errors, expiry: null });
  };

  if (!newEnrollment) return null;

  const finalAmount = Math.max(0, basePriceNum - discount);

  // ---------------- SUCCESS SCREEN ----------------
  if (isSuccess) {
    return (
      <div className="flex-1 bg-background w-full min-h-screen py-20 px-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-surface rounded-3xl p-10 border border-primary/30 shadow-[0_0_40px_rgba(16,185,129,0.2)] text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </motion.div>
          <h2 className="text-3xl font-bold text-text-primary dark:text-text-inverse mb-2">Payment Successful!</h2>
          <p className="text-text-muted mb-2">Transaction ID: TXN-{Math.floor(Math.random() * 1000000000)}</p>
          <p className="text-text-muted mb-8">You are now enrolled in {course?.title}. Redirecting to your dashboard...</p>
          <div className="w-8 h-8 border-4 border-primary/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
        </motion.div>
      </div>
    );
  }

  // ---------------- OTP SCREEN ----------------
  if (showOTP) {
    return (
      <div className="flex-1 bg-background w-full min-h-screen py-20 px-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-surface rounded-3xl p-8 border border-border shadow-2xl relative overflow-hidden"
        >
          {/* Fake Bank Header */}
          <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
          <div className="flex justify-between items-center mb-8 pt-2">
            <h3 className="text-xl font-bold text-text-primary dark:text-text-inverse flex items-center">
              <ShieldCheck className="w-6 h-6 text-primary mr-2" />
              Secure Banking
            </h3>
            <span className="text-sm text-text-muted">₹{finalAmount.toLocaleString('en-IN')}</span>
          </div>

          <p className="text-text-secondary text-sm leading-relaxed mb-6">
            An OTP has been sent to your registered mobile number ending in <span className="font-bold text-text-primary dark:text-text-inverse">XXXXXX1234</span>. Please enter it below to authenticate this transaction.
          </p>

          <form onSubmit={handleOTPSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-muted mb-2">Enter One Time Password (OTP)</label>
              <input 
                type="text" 
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="â€¢ â€¢ â€¢ â€¢ â€¢ â€¢"
                className="w-full bg-background border border-border rounded-xl px-4 py-4 text-center text-2xl tracking-widest text-text-primary dark:text-text-inverse focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <button 
              type="submit"
              disabled={isProcessing || otp.length < 4}
              className="w-full py-4 bg-primary hover:bg-primary disabled:bg-primary/50 text-text-primary dark:text-text-inverse font-bold rounded-xl transition-all shadow-lg flex items-center justify-center disabled:cursor-not-allowed"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Pay"}
            </button>
          </form>

          <div className="text-center mt-6">
            <button className="text-sm text-primary hover:underline">Resend OTP</button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ---------------- MAIN CHECKOUT SCREEN ----------------
  return (
    <div className="flex-1 bg-background w-full min-h-screen py-16 px-6">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left: Payment Methods */}
        <div className="w-full lg:w-[65%] space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary dark:text-text-inverse mb-2">Checkout</h1>
            <p className="text-text-muted flex items-center">
              <Lock className="w-4 h-4 mr-2" />
              Secure 256-bit SSL encryption
            </p>
          </div>

          <div className="bg-surface rounded-2xl border border-border/50 overflow-hidden shadow-xl">
            {/* Payment Method Tabs */}
            <div className="flex border-b border-border/50 overflow-x-auto hide-scrollbar">
              <button 
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-4 px-6 flex items-center justify-center space-x-2 font-semibold transition-colors border-b-2 whitespace-nowrap ${paymentMethod === 'card' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-muted hover:text-text-primary dark:text-text-inverse hover:bg-slate-800/50'}`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Credit / Debit Card</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('upi')}
                className={`flex-1 py-4 px-6 flex items-center justify-center space-x-2 font-semibold transition-colors border-b-2 whitespace-nowrap ${paymentMethod === 'upi' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-muted hover:text-text-primary dark:text-text-inverse hover:bg-slate-800/50'}`}
              >
                <Smartphone className="w-5 h-5" />
                <span>UPI</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('netbanking')}
                className={`flex-1 py-4 px-6 flex items-center justify-center space-x-2 font-semibold transition-colors border-b-2 whitespace-nowrap ${paymentMethod === 'netbanking' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-muted hover:text-text-primary dark:text-text-inverse hover:bg-slate-800/50'}`}
              >
                <Building className="w-5 h-5" />
                <span>Net Banking</span>
              </button>
            </div>

            <div className="p-8">
              <AnimatePresence mode="wait">
                {paymentMethod === 'card' && (
                  <motion.form 
                    key="card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleInitialSubmit} 
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Name on Card</label>
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className={`w-full bg-background border rounded-xl px-4 py-3.5 text-text-primary dark:text-text-inverse focus:outline-none transition-all ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-1 focus:ring-blue-500'}`}
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.name}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Card Number</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          required
                          value={cardNumber}
                          onChange={handleCardChange}
                          placeholder="0000 0000 0000 0000"
                          className={`w-full bg-background border rounded-xl pl-12 pr-4 py-3.5 text-text-primary dark:text-text-inverse font-mono focus:outline-none transition-all ${errors.card ? 'border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-1 focus:ring-blue-500'}`}
                        />
                        <CreditCard className="absolute left-4 top-4 w-5 h-5 text-text-muted" />
                      </div>
                      {errors.card && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.card}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Expiry Date</label>
                        <input 
                          type="text" 
                          required
                          value={expiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className={`w-full bg-background border rounded-xl px-4 py-3.5 text-text-primary dark:text-text-inverse font-mono focus:outline-none transition-all ${errors.expiry ? 'border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-1 focus:ring-blue-500'}`}
                        />
                        {errors.expiry && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.expiry}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">CVV</label>
                        <input 
                          type="password" 
                          required
                          maxLength={4}
                          value={cvv}
                          onChange={(e) => {
                            setCvv(e.target.value.replace(/\D/g, ""));
                            if(errors.cvv) setErrors({...errors, cvv: null});
                          }}
                          placeholder="123"
                          className={`w-full bg-background border rounded-xl px-4 py-3.5 text-text-primary dark:text-text-inverse font-mono focus:outline-none transition-all ${errors.cvv ? 'border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-1 focus:ring-blue-500'}`}
                        />
                        {errors.cvv && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.cvv}</p>}
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-4 mt-4 bg-primary hover:bg-primary disabled:bg-primary/50 text-text-primary dark:text-text-inverse font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Connecting to Bank...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-5 w-5" />
                          <span>Pay ₹{finalAmount.toLocaleString('en-IN')} Securely</span>
                        </>
                      )}
                    </button>
                  </motion.form>
                )}

                {paymentMethod === 'upi' && (
                  <motion.form 
                    key="upi"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleInitialSubmit} 
                    className="space-y-6"
                  >
                    <div className="text-center p-6 bg-background rounded-xl border border-border">
                      <div className="w-40 h-40 bg-surface p-2 rounded-xl mx-auto mb-4 flex items-center justify-center">
                        <div className="w-full h-full border-4 border-dashed border-border flex items-center justify-center text-text-muted font-bold bg-background">
                          Scan QR Code
                        </div>
                      </div>
                      <p className="text-text-secondary text-sm mb-4">Scan the QR code with PhonePe, GPay, or Paytm</p>
                      
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="h-[1px] flex-1 bg-slate-700" />
                        <span className="text-text-muted text-sm font-medium">OR ENTER UPI ID</span>
                        <div className="h-[1px] flex-1 bg-slate-700" />
                      </div>

                      <div className="flex gap-4">
                        <input 
                          type="text" 
                          required
                          placeholder="username@upi"
                          className="flex-1 bg-surface border border-slate-600 rounded-xl px-4 py-3.5 text-text-primary dark:text-text-inverse focus:outline-none focus:border-primary transition-colors"
                        />
                        <button 
                          type="submit"
                          disabled={isProcessing}
                          className="px-8 bg-primary hover:bg-primary disabled:bg-primary/50 text-text-primary dark:text-text-inverse font-bold rounded-xl transition-colors disabled:cursor-not-allowed flex items-center"
                        >
                          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify"}
                        </button>
                      </div>
                    </div>
                  </motion.form>
                )}

                {paymentMethod === 'netbanking' && (
                  <motion.form 
                    key="netbanking"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleInitialSubmit} 
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-4">Select your Bank</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-2">
                        {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank', 'Bank of Baroda'].map(bank => (
                          <div 
                            key={bank} 
                            onClick={() => {
                              setSelectedBank(bank);
                              if(errors.bank) setErrors({...errors, bank: null});
                            }}
                            className={`border ${selectedBank === bank ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 bg-background hover:bg-primary/5'} rounded-xl p-4 text-center cursor-pointer transition-colors`}
                          >
                            <Building className={`w-6 h-6 mx-auto mb-2 ${selectedBank === bank ? 'text-primary' : 'text-text-muted'}`} />
                            <span className="text-sm text-text-secondary font-medium">{bank}</span>
                          </div>
                        ))}
                      </div>
                      {errors.bank && <p className="text-red-500 text-xs mb-4 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.bank}</p>}
                      
                      <button 
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-4 mt-6 bg-primary hover:bg-primary disabled:bg-primary/50 text-text-primary dark:text-text-inverse font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Redirecting to {selectedBank || 'Bank'}...</span>
                          </>
                        ) : (
                          <>
                            <span>Proceed to Payment</span>
                            <ChevronRight className="h-5 w-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
            
            <div className="bg-slate-800/30 p-4 border-t border-border/50 flex justify-center space-x-6 grayscale opacity-60 text-sm">
              <span className="text-text-primary dark:text-text-inverse font-bold tracking-wider italic">VISA</span>
              <span className="text-text-primary dark:text-text-inverse font-bold tracking-wider">MasterCard</span>
              <span className="text-text-primary dark:text-text-inverse font-bold tracking-wider">RuPay</span>
              <span className="text-text-primary dark:text-text-inverse font-bold tracking-wider italic">UPI</span>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="w-full lg:w-[35%]">
          <div className="bg-background rounded-2xl border border-border/50 p-6 shadow-xl sticky top-24">
            <h2 className="text-xl font-bold text-text-primary dark:text-text-inverse mb-6 border-b border-border/50 pb-4">Order Summary</h2>
            
            <div className="flex gap-4 mb-6">
              <div className="w-20 h-20 bg-surface rounded-xl border border-border overflow-hidden shrink-0">
                <img src={course?.image} alt={course?.title} loading="lazy" className="w-full h-full object-cover opacity-80" />
              </div>
              <div>
                <h3 className="text-text-primary dark:text-text-inverse font-bold leading-tight mb-1">{course?.title}</h3>
                <p className="text-primary text-sm font-semibold">{course?.category === 'summer' ? 'Summer Bootcamp' : 'Self-Paced Course'}</p>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="mb-6 pb-6 border-b border-border/50">
              <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center">
                <Tag className="w-4 h-4 mr-2 text-primary"/> Have a Promo Code?
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="e.g. CODESKILL50"
                  className="flex-1 bg-surface border border-border rounded-lg px-4 py-2.5 text-text-primary dark:text-text-inverse focus:outline-none focus:border-primary uppercase transition-colors"
                />
                <button 
                  onClick={applyPromoCode}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoMessage && (
                <p className={`text-xs mt-2 ${discount > 0 ? 'text-primary' : 'text-red-400'}`}>
                  {promoMessage}
                </p>
              )}
            </div>

            <div className="space-y-4 text-sm mb-6 border-b border-border/50 pb-6">
              <div className="flex justify-between text-text-secondary">
                <span>Course Price</span>
                <span>₹{basePriceNum.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Discount Applied</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-text-secondary">
                <span>GST (18%)</span>
                <span className="text-primary">Included</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-8">
              <span className="text-lg text-text-secondary font-medium">Total Amount</span>
              <span className="text-3xl font-extrabold text-primary">₹{finalAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-primary font-bold text-sm mb-1">Safe & Secure</h4>
                <p className="text-text-muted text-xs leading-relaxed">Your transaction is protected by industry-standard 256-bit encryption.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
