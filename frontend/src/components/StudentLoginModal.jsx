import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Sparkles, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const StudentLoginModal = ({
  isOpen,
  onClose,
  onSubmit,
  categoryTitle,
  categoryColor,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age) newErrors.age = 'Age is required';
    // You can add more specific validation if needed (min/max age, etc.)

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit({
      type: 'guest',
      name: formData.name.trim(),
      age: Number(formData.age),
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${categoryColor} p-6 text-white relative overflow-hidden`}>
              <motion.div
                className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 20, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-5 -left-5 w-20 h-20 bg-white/10 rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 10, repeat: Infinity }}
              />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative">
                <motion.div
                  initial={{ rotate: -10 }}
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-10 h-10 mb-3" />
                </motion.div>

                <h2 className="text-2xl font-black mb-1">Ready for {categoryTitle}?</h2>
                <p className="opacity-90">Enter your details to start the test!</p>
              </div>
            </div>

            {/* Form - Only Guest / New Student */}
            <form onSubmit={handleSubmit} className="p-6 pt-8 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <Label className="text-gray-700 font-semibold flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`h-12 rounded-xl ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-700 font-semibold flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    Age
                  </Label>
                  <Input
                    type="number"
                    placeholder="Your age"
                    min="6"
                    max="16"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className={`h-12 rounded-xl ${errors.age ? 'border-red-500' : ''}`}
                  />
                  {errors.age && (
                    <p className="text-red-500 text-sm mt-1">{errors.age}</p>
                  )}
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className={`w-full h-14 text-lg font-bold bg-gradient-to-r ${categoryColor} text-white rounded-xl shadow-lg`}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Test
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StudentLoginModal;