import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const RegistrationForm = () => {
  const form = useForm({
    defaultValues: {
      name: "",
      age: "",
      category: "",
      email: "",
      phone: "",
      whatsapp: "",
      school: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setSuccess(false);

    try {
      console.log("Submitting registration to Google Sheets:", data);

      await fetch(
        "https://script.google.com/macros/s/AKfycbyDgBy6GAwyb0apimKzoJCjSxmftv5z8hFglalRQqVHZ2YCEdfn-QiGFlCB0fkw1Hny/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            name: data.name,
            age: data.age,
            category: data.category,
            email: data.email,
            phone: data.phone,
            whatsapp: data.whatsapp,
            school: data.school,
            timestamp: new Date().toISOString(),
          }).toString(),
        }
      );

      setSuccess(true);
      form.reset();
    } catch (error) {
      console.error("Error submitting registration:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
        Spelling Bee Registration
      </h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {/* Full Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Age */}
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter age" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Junior">Junior (6–9 yrs)</option>
                    <option value="Senior">Senior (10–15 yrs)</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* WhatsApp */}
          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="Enter WhatsApp number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* School */}
          <FormField
            control={form.control}
            name="school"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>School Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter school name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <FormItem className="sm:col-span-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white hover:bg-green-700"
            >
              {loading ? "Submitting..." : "Register"}
            </Button>
            {success && (
              <p className="text-green-600 text-center mt-2">
                ✅ Registration successful!
              </p>
            )}
          </FormItem>
        </form>
      </Form>
    </div>
  );
};

export default RegistrationForm;
