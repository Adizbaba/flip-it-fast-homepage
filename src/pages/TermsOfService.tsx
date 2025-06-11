
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Terms of Service</h1>
          
          <div className="prose prose-lg mx-auto space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using FastFlip, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
              <p className="text-muted-foreground mb-4">
                To use our auction services, you must create an account and provide accurate information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>You must be at least 18 years old to create an account</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must provide accurate and complete information</li>
                <li>One person may maintain only one account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Auction Rules</h2>
              <p className="text-muted-foreground mb-4">
                All auctions on FastFlip are governed by the following rules:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>All bids are binding contracts</li>
                <li>Winners must complete payment within 48 hours</li>
                <li>Items must be accurately described</li>
                <li>Sellers must honor successful auctions</li>
                <li>FastFlip reserves the right to cancel fraudulent auctions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Prohibited Activities</h2>
              <p className="text-muted-foreground mb-4">
                Users are prohibited from:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Listing illegal or prohibited items</li>
                <li>Bid manipulation or shill bidding</li>
                <li>Creating multiple accounts</li>
                <li>Circumventing auction fees</li>
                <li>Harassing other users</li>
                <li>Violating intellectual property rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Fees and Payments</h2>
              <p className="text-muted-foreground mb-4">
                FastFlip charges fees for certain services:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Listing fees may apply to certain categories</li>
                <li>Final value fees are charged on successful sales</li>
                <li>Payment processing fees apply to all transactions</li>
                <li>Fees are subject to change with notice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                FastFlip acts as a marketplace platform. We are not responsible for the actual transaction between buyers and sellers. 
                Our liability is limited to the extent permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
              <p className="text-muted-foreground">
                We reserve the right to terminate or suspend accounts that violate these terms. 
                Users may also delete their accounts at any time through their account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Users will be notified of significant changes, 
                and continued use of the service constitutes acceptance of modified terms.
              </p>
            </section>

            <p className="text-sm text-muted-foreground mt-8 pt-4 border-t">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
