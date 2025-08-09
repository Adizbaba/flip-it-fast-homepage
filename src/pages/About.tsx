import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <SEO title="About FastFlip | FastFlip" description="Learn about FastFlip’s mission, values, and story." type="website" />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center">About FastFlip</h1>
            
            {/* Mission Statement */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground">
                At FastFlip, our mission is to revolutionize the online auction experience by creating a fast, secure, and user-friendly platform where buyers and sellers can connect with confidence.
              </p>
            </section>

            {/* Values */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Our Values</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 rounded-lg bg-muted">
                  <h3 className="text-xl font-semibold mb-2">Trust</h3>
                  <p>Building a reliable platform where users feel secure in their transactions.</p>
                </div>
                <div className="p-6 rounded-lg bg-muted">
                  <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                  <p>Continuously improving our platform with cutting-edge technology.</p>
                </div>
                <div className="p-6 rounded-lg bg-muted">
                  <h3 className="text-xl font-semibold mb-2">Community</h3>
                  <p>Fostering a vibrant marketplace where everyone can thrive.</p>
                </div>
              </div>
            </section>

            {/* Company Background */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
              <p className="text-lg text-muted-foreground mb-4">
                Founded in 2025, FastFlip emerged from a simple idea: make online auctions faster and more accessible. What started as a small startup has grown into a trusted platform serving thousands of users across the globe.
              </p>
              <p className="text-lg text-muted-foreground">
                Our team of dedicated professionals works tirelessly to ensure that every auction on FastFlip runs smoothly, securely, and efficiently.
              </p>
            </section>

            {/* Placeholder for Team Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
              <p className="text-muted-foreground">
                Meet the people behind FastFlip who make it all happen.
                {/* Team member profiles can be added here later */}
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
