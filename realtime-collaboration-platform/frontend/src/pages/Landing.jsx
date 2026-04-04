import { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Showcase from "../components/Showcase";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";

export default function Landing() {
    const [showModal, setShowModal] = useState(false);

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#fff", color: "#111", minHeight: "100vh" }}>
            <Navbar onSignIn={() => setShowModal(true)} />
            <Hero onGetStarted={() => setShowModal(true)} />
            <Features />
            <Showcase />
            <Footer />
            <AuthModal show={showModal} onClose={() => setShowModal(false)} />
        </div>
    );
}