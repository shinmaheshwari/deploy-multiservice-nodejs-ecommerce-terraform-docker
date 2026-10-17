import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile, error } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'US'
    }
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [section, subField] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    const result = await updateProfile(formData);
    
    if (result.success) {
      setSuccess('Profile updated successfully!');
      setEditing(false);
    }
    
    setLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || 'US'
      }
    });
    setEditing(false);
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <h1>Profile</h1>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: '600px' }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '3rem', 
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h1>My Profile</h1>
          {!editing && (
            <button 
              onClick={() => setEditing(true)}
              className="btn btn-primary"
            >
              Edit Profile
            </button>
          )}
        </div>

        {success && (
          <div className="success" style={{ marginBottom: '1rem' }}>
            {success}
          </div>
        )}

        {error && (
          <div className="error" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Basic Information</h3>
            
            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  disabled={!editing}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  disabled={!editing}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                value={user.email}
                disabled
                style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
              />
              <small style={{ color: '#6c757d' }}>
                Email cannot be changed. Contact support if needed.
              </small>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                className="form-control"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={!editing}
              />
            </div>
          </div>

          {/* Address Information */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Address Information</h3>
            
            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                className="form-control"
                value={formData.address.street}
                onChange={(e) => handleChange('address.street', e.target.value)}
                disabled={!editing}
              />
            </div>

            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.address.city}
                  onChange={(e) => handleChange('address.city', e.target.value)}
                  disabled={!editing}
                />
              </div>
              
              <div className="form-group">
                <label>State</label>
                <select
                  className="form-control"
                  value={formData.address.state}
                  onChange={(e) => handleChange('address.state', e.target.value)}
                  disabled={!editing}
                >
                  <option value="">Select State</option>
                  <option value="CA">California</option>
                  <option value="NY">New York</option>
                  <option value="TX">Texas</option>
                  <option value="FL">Florida</option>
                  <option value="WA">Washington</option>
                  <option value="IL">Illinois</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="OH">Ohio</option>
                </select>
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.address.zipCode}
                  onChange={(e) => handleChange('address.zipCode', e.target.value)}
                  disabled={!editing}
                />
              </div>
              
              <div className="form-group">
                <label>Country</label>
                <select
                  className="form-control"
                  value={formData.address.country}
                  onChange={(e) => handleChange('address.country', e.target.value)}
                  disabled={!editing}
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="MX">Mexico</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Account Information</h3>
            
            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Account Type</label>
                <div style={{ 
                  padding: '0.75rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '5px',
                  textTransform: 'capitalize'
                }}>
                  {user.role}
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Member Since</label>
                <div style={{ 
                  padding: '0.75rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '5px'
                }}>
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Account Status</label>
              <div style={{ 
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: user.isActive ? '#d4edda' : '#f8d7da',
                color: user.isActive ? '#155724' : '#721c24',
                borderRadius: '15px',
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}>
                {user.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          {editing && (
            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e9ecef'
            }}>
              <button 
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              
              <button 
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;