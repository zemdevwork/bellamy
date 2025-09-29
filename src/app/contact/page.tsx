import ContactForm from "../../components/ContactForm";
import Footer from "../../components/Footer";

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="page-wrap">
        <h1 className="page-title mb-6">Contact Us</h1>
        <ContactForm />
      </div>
      <Footer />
    </div>
  );
}
