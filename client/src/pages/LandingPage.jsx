import { useNavigate } from 'react-router-dom';
import { Heart, Map, Users, Award, ArrowRight, Shield, BookOpen } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Lagos Bright Futures</span>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => navigate('/login')}
                className="btn-secondary"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="btn-primary"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Empowering Every Child's <span className="text-primary-600">Bright Future</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A verified digital platform connecting orphanages in Lagos State with education, 
            resources, and sponsorship opportunities through technology and transparency.
          </p>
          <div className="flex justify-center space-x-4">
            <button onClick={() => navigate('/register')} className="btn-primary flex items-center space-x-2">
              <span>Register Your Orphanage</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/map')} className="btn-secondary flex items-center space-x-2">
              <Map className="w-5 h-5" />
              <span>Explore Map</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="card text-center">
            <Shield className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-gray-900 mb-2">3-Layer</h3>
            <p className="text-gray-600">Verification System</p>
          </div>
          <div className="card text-center">
            <Users className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-gray-900 mb-2">20 LGAs</h3>
            <p className="text-gray-600">Across Lagos State</p>
          </div>
          <div className="card text-center">
            <BookOpen className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-gray-900 mb-2">100%</h3>
            <p className="text-gray-600">Focus on Education</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How We Make a Difference
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Feature 
              icon={Shield}
              title="Verified Orphanages"
              description="3-layer verification with Lagos State Ministry approval ensures legitimacy and child safety."
            />
            <Feature 
              icon={Map}
              title="Interactive Mapping"
              description="Find orphanages by LGA, capacity, and needs across all of Lagos State."
            />
            <Feature 
              icon={BookOpen}
              title="Education Access"
              description="Connect children to public schools, e-learning, and skill development programs."
            />
            <Feature 
              icon={Heart}
              title="Sponsorship Programs"
              description="Transparent matching of sponsors with education and development initiatives."
            />
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Join us in building a brighter future for vulnerable children in Lagos State.
          </p>
          <button onClick={() => navigate('/register')} className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Get Started Today
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="w-6 h-6 text-primary-400" />
              <span className="text-lg font-semibold text-white">Lagos Bright Futures Initiative</span>
            </div>
            <p className="text-sm">
              In partnership with Lagos State Ministry of Youth & Social Development
            </p>
            <p className="text-sm mt-2">
              © 2025 Lagos Bright Futures. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon: Icon, title, description }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
        <Icon className="w-8 h-8 text-primary-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
