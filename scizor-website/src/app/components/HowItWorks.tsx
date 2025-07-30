export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Install & Launch",
      description: "Download Scizor and launch the application. It runs quietly in the background, monitoring your clipboard automatically.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      number: "02",
      title: "Copy & Capture",
      description: "Simply copy text as you normally would. Scizor automatically captures and organizes everything in your clipboard history.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      number: "03",
      title: "Enhance with AI",
      description: "Use global hotkeys to instantly enhance your text with AI. Improve grammar, tone, or expand content with a single keystroke.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      number: "04",
      title: "Organize & Access",
      description: "Access your enhanced text, notes, and clipboard history instantly. Everything is organized and searchable for maximum efficiency.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How Scizor Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started in minutes and transform your productivity workflow with our simple, 
            intuitive process that works seamlessly in the background.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 z-0" style={{ width: 'calc(100% - 4rem)' }}></div>
              )}
              
              <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                {/* Step Number */}
                <div className="absolute -top-4 left-8 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center text-blue-600 mb-6 mt-4">
                  {step.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Workflow?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of professionals who have already supercharged their productivity with Scizor.
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 