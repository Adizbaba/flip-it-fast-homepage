
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Heart, Zap, Target } from "lucide-react";

const Careers = () => {
  const jobOpenings = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "Join our frontend team to build amazing user experiences with React and TypeScript.",
      requirements: ["5+ years React experience", "TypeScript proficiency", "UI/UX sensibility"]
    },
    {
      id: 2,
      title: "Product Manager",
      department: "Product",
      location: "San Francisco, CA",
      type: "Full-time",
      description: "Lead product strategy and roadmap for our auction platform features.",
      requirements: ["3+ years product management", "Marketplace experience", "Data-driven mindset"]
    },
    {
      id: 3,
      title: "Customer Success Specialist",
      department: "Customer Success",
      location: "Remote",
      type: "Full-time",
      description: "Help our users succeed on the FastFlip platform and grow their businesses.",
      requirements: ["Customer service experience", "Excellent communication", "Problem-solving skills"]
    }
  ];

  const values = [
    {
      icon: Users,
      title: "Collaboration",
      description: "We believe great things happen when diverse minds work together."
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "Every decision we make puts our users and their success at the center."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We're constantly pushing boundaries to create better auction experiences."
    },
    {
      icon: Target,
      title: "Results Driven",
      description: "We set ambitious goals and work together to achieve meaningful outcomes."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-auction-purple to-auction-magenta text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Join the FastFlip Team</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Help us build the future of online auctions and create amazing experiences for millions of users worldwide.
            </p>
            <Button size="lg" variant="secondary">
              View Open Positions
            </Button>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Values</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                These core values guide everything we do and help create an environment where everyone can thrive.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="bg-auction-purple/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-auction-purple" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Work at FastFlip?</h2>
              <p className="text-muted-foreground text-lg">
                We offer competitive benefits and a culture that supports your growth and well-being.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Health & Wellness</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Comprehensive health insurance</li>
                  <li>• Mental health support</li>
                  <li>• Gym membership reimbursement</li>
                  <li>• Flexible time off</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Growth & Development</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Learning stipend</li>
                  <li>• Conference attendance</li>
                  <li>• Mentorship programs</li>
                  <li>• Career advancement paths</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Work-Life Balance</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Remote-first culture</li>
                  <li>• Flexible working hours</li>
                  <li>• Home office setup</li>
                  <li>• Team building events</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Job Openings */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Open Positions</h2>
              <p className="text-muted-foreground text-lg">
                Find your next opportunity and help us build something amazing.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-6">
              {jobOpenings.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                        <CardDescription className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {job.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.type}
                          </span>
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{job.department}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{job.description}</p>
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Requirements:</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {job.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    <Button>Apply Now</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Don't See a Perfect Fit?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              We're always looking for talented people to join our team. Send us your resume and tell us how you'd like to contribute to FastFlip's mission.
            </p>
            <Button size="lg">
              Send Us Your Resume
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
