import Footer from "../../components/Footer";

export default function OurStoryPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">Our Story</h1>
          <p className="text-xl text-blue-100 leading-relaxed">
            From humble beginnings to becoming a trusted name in quality products, 
            discover the journey that shaped Bellamy into what it is today.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* The Beginning */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">The Beginning</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded in 2015, Bellamy started as a small family business with a simple mission: 
                  to provide high-quality products that make a difference in people&apos;s lives. What began 
                  as a passion project in a garage has grown into a trusted brand serving customers worldwide.
                </p>
                <p>
                  Our founder, Sarah Johnson, had a vision of creating products that combined 
                  exceptional quality with thoughtful design. She believed that every customer 
                  deserved access to premium products without compromise.
                </p>
                <p>
                  Starting with just three products and a handful of customers, we&apos;ve built our 
                  reputation one satisfied customer at a time. Our commitment to quality and 
                  customer service has been the foundation of our success.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 h-80 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="h-16 w-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Company Founder Photo</p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do and shape our commitment to excellence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Quality First</h3>
              <p className="text-gray-600">
                We never compromise on quality. Every product undergoes rigorous testing 
                to ensure it meets our high standards.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Customer Care</h3>
              <p className="text-gray-600">
                Our customers are at the heart of everything we do. We&apos;re committed to 
                providing exceptional service and support.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Innovation</h3>
              <p className="text-gray-600">
                We continuously innovate and improve our products to stay ahead of 
                the curve and meet evolving customer needs.
              </p>
            </div>
          </div>
        </section>

        {/* Our Journey */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Our Journey</h2>
          
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">2015 - The Foundation</h3>
                  <p className="text-gray-600">
                    Bellamy was founded with a vision to create quality products. We started 
                    with our first product line and a small team of dedicated individuals.
                  </p>
                </div>
              </div>
              <div className="w-4 h-4 bg-blue-600 rounded-full flex-shrink-0"></div>
              <div className="text-2xl font-bold text-blue-600">2015</div>
            </div>
            
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="flex-1">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">2018 - First Expansion</h3>
                  <p className="text-gray-600">
                    We expanded our product range and opened our first retail location. 
                    Our customer base grew to over 10,000 satisfied customers.
                  </p>
                </div>
              </div>
              <div className="w-4 h-4 bg-green-600 rounded-full flex-shrink-0"></div>
              <div className="text-2xl font-bold text-green-600">2018</div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">2021 - Digital Transformation</h3>
                  <p className="text-gray-600">
                    We launched our e-commerce platform and expanded internationally. 
                    Our online presence helped us reach customers across the globe.
                  </p>
                </div>
              </div>
              <div className="w-4 h-4 bg-purple-600 rounded-full flex-shrink-0"></div>
              <div className="text-2xl font-bold text-purple-600">2021</div>
            </div>
            
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="flex-1">
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">2024 - Today</h3>
                  <p className="text-gray-600">
                    Today, Bellamy serves over 100,000 customers worldwide with a 
                    comprehensive range of products and exceptional customer service.
                  </p>
                </div>
              </div>
              <div className="w-4 h-4 bg-orange-600 rounded-full flex-shrink-0"></div>
              <div className="text-2xl font-bold text-orange-600">2024</div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The passionate individuals behind Bellamy&apos;s success, dedicated to bringing you the best products and service.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gray-200 w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Sarah Johnson</h3>
              <p className="text-blue-600 font-medium mb-2">Founder & CEO</p>
              <p className="text-gray-600 text-sm">
                Visionary leader with 15+ years of experience in product development and customer service.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-200 w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Michael Chen</h3>
              <p className="text-blue-600 font-medium mb-2">Head of Operations</p>
              <p className="text-gray-600 text-sm">
                Operations expert ensuring smooth logistics and quality control across all our products.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-200 w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Emily Rodriguez</h3>
              <p className="text-blue-600 font-medium mb-2">Customer Success Manager</p>
              <p className="text-gray-600 text-sm">
                Dedicated to ensuring every customer has an exceptional experience with our products.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Join Our Story</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Be part of our journey as we continue to grow and serve customers worldwide. 
            Discover our products and experience the Bellamy difference.
          </p>
          <div className="space-x-4">
            <a 
              href="#" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Shop Now
            </a>
            <a 
              href="/contact" 
              className="inline-block border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}
