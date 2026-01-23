import React from "react";
import { Mail, Linkedin, Users, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Team = () => {
  const teamMembers = [
    {
      name: "Hathikur Rahman H",
      role: "CEO & Student Supportive Executive",
      photo: "/images/hathi.jpg",
      email: "rajesh@grovvestacademy.com",
      linkedin: "linkedin.com/in/rajeshkumar",
      phone: "+91 7418991909",
    },
    // {
    //   name: "Abubakkersiddiq",
    //   role: "Founder & Course Trainer",
    //   photo: "/images/abu.jpg",
    //   email: "Abubakkarsiddiq0076@gmail.com",
    //   linkedin: "linkedin.com/in/priyasharma",
    //   phone: "+91 9445238959",
    // },
    {
      name: "Madesh",
      role: "Marketing Head, Co-Founder & Promotion Head",
      photo: "/images/madhes.jpg",
      email: "madhesh6112004@gmail.com",
      linkedin: "linkedin.com/in/amitpatel",
      phone: "+91 6380866922",
    },
    {
      name: "Hariharan",
      role: "Enrollment Manager & Graphic Designer",
      photo: "/images/hari.jpg",
      email: "hariharansenthilkumar31@gmail.com",
      linkedin: "linkedin.com/in/nehasingh",
      phone: "+91 8870838606",
    },
    {
      name: "Abdul Bashith",
      role: "Financial Manager",
      photo: "/images/bashi.jpg",
      email: "vikram@grovvestacademy.com",
      linkedin: "linkedin.com/in/vikrammehta",
      phone: "+91 93615 85175",
    },
    {
      name: "Usman",
      role: "Social Media Lead & Operation Manager",
      photo: "/images/usman.jpg",
      email: "ffabuloususman@gmail.com",
      linkedin: "linkedin.com/in/vikrammehta",
      phone: "+91 9677047408",
    },
  ];

  const values = [
    {
      title: "Transparency",
      description:
        "We believe in clear, honest communication about investments and market realities.",
      icon: "🔍",
    },
    {
      title: "Accessibility",
      description:
        "Making complex financial concepts simple and accessible to everyone.",
      icon: "🎯",
    },
    {
      title: "Excellence",
      description:
        "Continuous improvement in our teaching methods and course content quality.",
      icon: "⭐",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 via-white to-green-50 py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Meet Our <span className="gradient-text">Expert Team</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            Our dedicated team of financial experts, educators, and technology
            professionals are committed to making investment education
            accessible to everyone.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="bg-white py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="group border border-gray-100 shadow-md hover:shadow-lg rounded-xl overflow-hidden transition-all duration-300"
              >
                {/* Image */}
                <div className="w-full bg-gray-100 overflow-hidden rounded-t-xl">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full max-h-72 object-cover mx-auto"
                  />
                </div>

                {/* Content */}
                <CardContent className="p-4 sm:p-5 text-center">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 group-hover:text-green-700 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-green-600 text-sm sm:text-base font-medium mb-1">
                    {member.role}
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    {member.phone}
                  </p>

                  {/* Social Links */}
                  <div className="flex justify-center space-x-3 pt-3 border-t border-gray-100 mt-3">
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-green-100 rounded-full text-green-700 hover:bg-green-200 transition"
                    >
                      <Mail size={14} className="sm:w-4 sm:h-4" />
                    </a>
                    <a
                      href={`https://${member.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-green-100 rounded-full text-green-700 hover:bg-green-200 transition"
                    >
                      <Linkedin size={14} className="sm:w-4 sm:h-4" />
                    </a>
                    <a
                      href={`tel:${member.phone}`}
                      className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-green-100 rounded-full text-green-700 hover:bg-green-200 transition"
                    >
                      <Phone size={14} className="sm:w-4 sm:h-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Our <span className="gradient-text">Core Values</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              What drives us to deliver exceptional financial education
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="text-center p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-green-700 to-green-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <Users className="w-14 h-14 mx-auto mb-5 text-green-200" />
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Want to Join Our Team?
          </h2>
          <p className="text-lg mb-6 text-green-100">
            We're always looking for passionate individuals who want to make a
            difference in financial education.
          </p>
          <a
            href="mailto:careers@growvestacademy@gmail.com"
            className="inline-flex items-center px-6 py-3 bg-white text-green-700 font-medium rounded-lg hover:bg-green-50 transition"
          >
            <Mail className="mr-2 w-5 h-5" />
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  );
};

export default Team;
