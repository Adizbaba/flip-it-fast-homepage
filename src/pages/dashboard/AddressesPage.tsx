import AddressManager from "@/components/address/AddressManager";
import SEO from "@/components/SEO";

const AddressesPage = () => {
  return (
    <>
      <SEO 
        title="Saved Addresses | FastFlip"
        description="Manage your saved shipping addresses for faster checkout"
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Saved Addresses</h1>
          <p className="text-muted-foreground">
            Manage your shipping addresses for faster checkout
          </p>
        </div>
        <AddressManager />
      </div>
    </>
  );
};

export default AddressesPage;