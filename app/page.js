import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main>
      {/* Navigation */}
      <nav>
        <div className="container">
          <Link href="/" className="logo">
            <img src="/EYP Logo_New.png" alt="Externally Yours Productions" />
          </Link>
          <div className="nav-links">
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/photography">Photography</Link>
            <Link href="/videography">Videography</Link>
            <Link href="/dj-entertainment">DJ Entertainment</Link>
            <Link href="/dj-login">DJ Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Externally Yours Productions</h1>
          <p>Capturing Life&apos;s Most Precious Moments</p>
          <Link href="/about" className="cta-button">Learn More</Link>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <h2>About Us</h2>
          <div className="about-content">
            <div className="about-text">
              <p>
                Externally Yours Productions is a full-service production company
                specializing in wedding photography, videography, and DJ services.
                We capture your special moments with creativity and professionalism.
              </p>
            </div>
            <div className="about-image">
              <Image
                src="/AboutUs/7L8A9573.jpg"
                alt="About Us"
                width={600}
                height={400}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services">
        <div className="container">
          <h2>Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>Photography</h3>
              <p>Professional wedding and event photography</p>
              <Link href="/photography">View Gallery</Link>
            </div>
            <div className="service-card">
              <h3>Videography</h3>
              <p>Cinematic wedding and event videography</p>
              <Link href="/videography">View Work</Link>
            </div>
            <div className="service-card">
              <h3>DJ Entertainment</h3>
              <p>Professional DJ services for your event</p>
              <Link href="/dj-entertainment">Learn More</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <h2>Contact Us</h2>
          <div className="contact-content">
            <div className="contact-info">
              <p>Email: info@externallyyours.com</p>
              <p>Phone: (555) 123-4567</p>
            </div>
            <form className="contact-form">
              <input type="text" placeholder="Name" required />
              <input type="email" placeholder="Email" required />
              <textarea placeholder="Message" rows="5" required></textarea>
              <button type="submit">Send Message</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}

