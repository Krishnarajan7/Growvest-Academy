import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, BookOpen, Home, Phone, Mail, MapPin } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (value, field) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({
      name: '',
      email: '',
      subject: '',
      category: '',
      message: ''
    });
  };

  const contactMethods = [
    {
      icon: User,
      title: 'General Support',
      description: 'Get help with your account, courses, or general questions',
      contact: 'growwithrs25@gmail.com',
      responseTime: 'Usually responds in 2-4 hours'
    },
    {
      icon: BookOpen,
      title: 'Course Support',
      description: 'Need help with course content or technical issues',
      contact: 'growwithrs25@gmail.com',
      responseTime: 'Usually responds in 1-2 hours'
    },
    {
      icon: Calendar,
      title: 'Partnership & Media',
      description: 'Business partnerships, media inquiries, and collaboration',
      contact: 'Growwithrs25@gmail.com',
      responseTime: 'Usually responds in 24-48 hours'
    },
  ];

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'You can reset your password by clicking on "Forgot Password" on the login page and following the instructions sent to your email.'
    },
    {
      question: 'Can I download course materials?',
      answer: 'Yes, premium members can download course materials including PDFs, worksheets, and presentations for offline study.'
    },
    {
      question: 'How do I upgrade to premium?',
      answer: 'You can upgrade to premium by visiting the Premium Plans page and selecting your preferred plan. The upgrade is instant after payment.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 7-day money-back guarantee for premium subscriptions. Contact our support team for refund requests.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="section-padding py-8">
        <div className="container-width max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8 scroll-reveal">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Get in Touch
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions about our courses, need technical support, or want to explore partnerships? 
              We're here to help you succeed in your investment journey.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Contact Form - Takes 2 columns */}
            <div className="lg:col-span-2 scroll-reveal">
              <Card className="shadow-lg hover-lift h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Send us a Message</CardTitle>
                  <p className="text-gray-600 text-sm">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="name" className="text-sm">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          required
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="email" className="text-sm">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          required
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="category" className="text-sm">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleSelectChange(value, 'category')}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Support</SelectItem>
                          <SelectItem value="course">Course Support</SelectItem>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="billing">Billing & Payment</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="subject" className="text-sm">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Brief description of your inquiry"
                        required
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="message" className="text-sm">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Provide detailed information about your inquiry..."
                        rows={4}
                        required
                        className="resize-none"
                      />
                    </div>

                    <Button type="submit" className="w-full btn-primary">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info Sidebar - Takes 1 column */}
            <div className="space-y-4 scroll-reveal">
              {/* Quick Contact */}
              <Card className="bg-gradient-to-r from-green-600 to-green-400 text-white">
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="mr-2 flex-shrink-0" size={16} />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <a href="mailto:Growwithrs25@gmail.com" className="text-green-100 hover:text-white text-sm">
                          Growvestacademy@gmail.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center">
  <Phone className="mr-2 flex-shrink-0" size={16} />
  <div>
    <p className="text-sm font-medium">Call</p>
    <a
      href="tel:+917418991909"
      className="text-green-100 hover:text-white text-sm"
    >
      +91 74189 91909
    </a>
  </div>
</div>

                    <div className="flex items-center">
                      <MapPin className="mr-2 flex-shrink-0" size={16} />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-green-100 text-sm">177/1 rahamaniya street Lalpet</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Home className="mr-2 flex-shrink-0" size={16} />
                      <div>
                        <p className="text-sm font-medium">Office Hours</p>
                        <p className="text-green-100 text-sm">Mon - Fri, 9:00 AM - 6:00 PM IST</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Methods */}
              <div className="space-y-3">
                {contactMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <Card key={index} className="hover-lift">
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="text-white" size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">{method.title}</h4>
                            <p className="text-gray-600 text-xs mb-1">{method.description}</p>
                            <p className="text-xs text-gray-500">{method.responseTime}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="scroll-reveal">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {faqs.slice(0, 2).map((faq, index) => (
                  <Card key={index} className="hover-lift">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm">{faq.question}</h3>
                      <p className="text-gray-600 text-sm">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="scroll-reveal">
              <h2 className="text-xl font-bold text-gray-900 mb-4">&nbsp;</h2>
              <div className="space-y-3">
                {faqs.slice(2, 4).map((faq, index) => (
                  <Card key={index + 2} className="hover-lift">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm">{faq.question}</h3>
                      <p className="text-gray-600 text-sm">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center scroll-reveal">
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Still Have Questions?
              </h2>
              <p className="text-gray-600 mb-4 max-w-2xl mx-auto text-sm">
                Can't find what you're looking for? Our support team is always ready to help. 
                We typically respond within a few hours during business hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="mailto:Growwithrs25@gmail.com">
                  <Button size="lg" className="btn-primary">
                    Email Support
                  </Button>
                </a>
                <a href="/premium">
                  <Button size="lg" variant="outline">
                    View Premium Support
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
