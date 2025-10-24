import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Building, Calendar, Shield, X, Info } from 'lucide-react';

interface ProfileData {
  full_name: string;
  business_name: string | null;
  created_at: string;
}

export const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setFullName(data.full_name);
      setBusinessName(data.business_name || '');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        business_name: businessName || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.id);

    if (!error) {
      await loadProfile();
      setEditing(false);
    }

    setLoading(false);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Your Profile</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-slate-700 mb-2">
                Business Name (Optional)
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="businessName"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFullName(profile.full_name);
                  setBusinessName(profile.business_name || '');
                }}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <User className="w-6 h-6 text-slate-600" />
              <div>
                <p className="text-sm text-slate-600">Full Name</p>
                <p className="text-lg font-medium text-slate-900">{profile.full_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <Building className="w-6 h-6 text-slate-600" />
              <div>
                <p className="text-sm text-slate-600">Business Name</p>
                <p className="text-lg font-medium text-slate-900">
                  {profile.business_name || 'Not specified'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <Calendar className="w-6 h-6 text-slate-600" />
              <div>
                <p className="text-sm text-slate-600">Member Since</p>
                <p className="text-lg font-medium text-slate-900">
                  {new Date(profile.created_at).toLocaleDateString('en-KE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-slate-900">Data Privacy & Security</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <h3 className="font-bold text-emerald-900 mb-2">Your Data is Safe</h3>
            <p className="text-sm text-emerald-700 leading-relaxed">
              SmartBooks AI respects your privacy. Your financial data is securely stored using
              industry-standard encryption and is never shared with third parties without your consent.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="font-bold text-blue-900 mb-2">Transparent AI</h3>
            <p className="text-sm text-blue-700 leading-relaxed">
              All AI insights are generated transparently based on your transaction patterns. We explain
              how each insight is calculated, and you maintain full control over your data at all times.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h3 className="font-bold text-slate-900 mb-3">Your Rights</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5">✓</span>
                <span>View, edit, or delete any of your transactions at any time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5">✓</span>
                <span>Export your data in standard formats</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5">✓</span>
                <span>Request complete deletion of your account and all associated data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5">✓</span>
                <span>Understand how AI insights are generated from your data</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setShowPrivacyModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900 transition-colors"
          >
            <Info className="w-5 h-5" />
            Read Full Privacy Policy
          </button>
        </div>
      </div>

      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Privacy Policy</h2>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-700 leading-relaxed">
              <section>
                <h3 className="font-bold text-slate-900 text-base mb-2">1. Data Collection</h3>
                <p>
                  SmartBooks AI collects only the information necessary to provide our services: your name,
                  email, business name (optional), and financial transaction records you choose to input.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-slate-900 text-base mb-2">2. Data Storage</h3>
                <p>
                  All data is stored securely using Supabase's PostgreSQL database with industry-standard
                  encryption. Access is restricted through Row Level Security policies ensuring you can only
                  access your own data.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-slate-900 text-base mb-2">3. AI Processing</h3>
                <p>
                  AI insights are generated locally using your transaction data. No data is sent to external
                  AI services. All processing happens within our secure infrastructure, and insights are
                  calculated using transparent algorithms based on financial best practices.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-slate-900 text-base mb-2">4. Data Sharing</h3>
                <p>
                  We never sell your data to third parties. Your financial information is private and
                  confidential. Data is only shared if required by law or with your explicit consent.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-slate-900 text-base mb-2">5. Your Control</h3>
                <p>
                  You maintain complete control over your data. You can view, edit, delete any transaction,
                  or request complete account deletion at any time.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-slate-900 text-base mb-2">6. Contact</h3>
                <p>
                  For privacy concerns or questions, contact us at privacy@smartbooksai.com
                </p>
              </section>
            </div>

            <div className="border-t border-slate-200 p-6">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
