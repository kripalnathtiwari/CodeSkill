import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { getApiUrl } from '../utils/apiConfig';

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setIsSubmitting(true);
      setErrorMsg('');
      try {
        await axios.post(getApiUrl('/api/v1/contact'), formData);
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({ name: '', email: '', message: '' });
        }, 3000);
      } catch (error) {
        console.error("Failed to send contact email:", error);
        setErrorMsg('Failed to send message. Please ensure the server is running and email is configured.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6 text-primary" />,
      title: "Email Us",
      details: "support@codeskill.com",
      description: "Our friendly team is here to help."
    },
    {
      icon: <Phone className="w-6 h-6 text-primary" />,
      title: "Call Us",
      details: "+91 8303445782",
      description: "Mon-Fri from 8am to 5pm."
    },
    {
      icon: <MapPin className="w-6 h-6 text-primary" />,
      title: "Visit Us",
      details: "Tech Park, Bengaluru, India",
      description: "Come say hello at our office HQ."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B1121] text-text-inverse pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
          >
            Get in <span className="bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">Touch</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-muted text-lg max-w-2xl mx-auto"
          >
            Have a question about our courses, certification, or training? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Methods */}
          <div className="lg:col-span-1 space-y-6">
            {contactMethods.map((method, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (index * 0.1) }}
                className="bg-[#111827] border border-border p-6 rounded-2xl flex items-start space-x-4 hover:border-primary/50 transition-colors"
              >
                <div className="bg-[#1e293b] p-3 rounded-xl flex-shrink-0">
                  {method.icon}
                </div>
                <div>
                  <h3 className="text-text-inverse font-bold text-lg mb-1">{method.title}</h3>
                  <p className="text-primary font-medium mb-1">{method.details}</p>
                  <p className="text-text-muted text-sm">{method.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-[#111827] border border-border p-8 rounded-3xl shadow-2xl relative overflow-hidden"
          >
            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-10 bg-[#111827] flex flex-col items-center justify-center text-center p-8"
              >
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-text-inverse mb-3">Message Sent!</h3>
                <p className="text-text-muted">Thanks for reaching out. We will get back to you shortly.</p>
              </motion.div>
            ) : null}

            <h2 className="text-2xl font-bold text-text-inverse mb-6">Send us a message</h2>
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-6 text-sm">
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-muted">Your Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    className="w-full bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-muted">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                    className="w-full bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Message</label>
                <textarea 
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={5}
                  placeholder="How can we help you?"
                  className="w-full bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary text-text-inverse font-bold rounded-xl px-6 py-4 flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
